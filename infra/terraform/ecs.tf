# ECS Fargate — SaunaServer
#
# - Cluster: 1개 (env 별 workspace 로 분리)
# - Task: Vapor 컨테이너. 메모리 한도 task_memory.
# - Service: rolling update, deployment_circuit_breaker 활성.
# - Auto-scaling: CPU 60% 타깃 트래킹 (WS heavy 워크로드라 CPU 가 보통 먼저 신호).

# ---- IAM ----
data "aws_iam_policy_document" "task_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Execution role: ECR pull + CloudWatch logs + Secrets 읽기
resource "aws_iam_role" "task_execution" {
  name               = "${local.name_prefix}-ecs-exec"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
  tags               = local.common_tags
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "task_execution_extra" {
  statement {
    sid     = "ReadSecrets"
    actions = ["secretsmanager:GetSecretValue"]
    resources = compact([
      aws_secretsmanager_secret.db_master.arn,
      try(aws_secretsmanager_secret.redis_auth[0].arn, ""),
    ])
  }
}

resource "aws_iam_role_policy" "task_execution_extra" {
  name   = "${local.name_prefix}-ecs-exec-extra"
  role   = aws_iam_role.task_execution.id
  policy = data.aws_iam_policy_document.task_execution_extra.json
}

# Task role: 앱이 런타임에 호출하는 AWS API (현재 없음 — 추후 APNs 키를 Secrets 에서 읽을 때)
resource "aws_iam_role" "task" {
  name               = "${local.name_prefix}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.task_assume.json
  tags               = local.common_tags
}

# ---- Logs ----
resource "aws_cloudwatch_log_group" "server" {
  name              = "/aws/ecs/${local.name_prefix}-server"
  retention_in_days = local.is_prod ? 30 : 7
  tags              = local.common_tags
}

# ---- Cluster ----
resource "aws_ecs_cluster" "main" {
  name = "${local.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = local.is_prod ? "enabled" : "disabled"
  }

  tags = merge(local.common_tags, { Component = "ecs" })
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = local.is_prod ? "FARGATE" : "FARGATE_SPOT"
    weight            = 1
    base              = 1
  }
}

# ---- Task definition ----
resource "aws_ecs_task_definition" "server" {
  family                   = "${local.name_prefix}-server"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "server"
      image     = "${aws_ecr_repository.server.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "ENV", value = var.env },
        { name = "PORT", value = tostring(var.container_port) },
        { name = "REDIS_HOST", value = local.redis_endpoint },
        { name = "REDIS_PORT", value = "6379" },
        { name = "DATABASE_HOST", value = aws_db_instance.postgres.address },
        { name = "DATABASE_PORT", value = "5432" },
        { name = "DATABASE_NAME", value = var.db_name },
      ]

      secrets = [
        {
          name      = "DATABASE_USER"
          valueFrom = "${aws_secretsmanager_secret.db_master.arn}:username::"
        },
        {
          name      = "DATABASE_PASSWORD"
          valueFrom = "${aws_secretsmanager_secret.db_master.arn}:password::"
        },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.server.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "server"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "wget -q -O - http://127.0.0.1:${var.container_port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 30
      }
    }
  ])

  tags = merge(local.common_tags, { Component = "ecs" })
}

# Redis endpoint resolution — dev/prod 분기
locals {
  redis_endpoint = local.is_prod ? (
    try(aws_elasticache_replication_group.prod[0].primary_endpoint_address, "")
    ) : (
    try(aws_elasticache_cluster.dev[0].cache_nodes[0].address, "")
  )
}

# ---- Service ----
resource "aws_ecs_service" "server" {
  name            = "${local.name_prefix}-server"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.server.arn
  desired_count   = var.service_desired_count
  launch_type     = "FARGATE"

  enable_execute_command = !local.is_prod

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs_task.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.server.arn
    container_name   = "server"
    container_port   = var.container_port
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  health_check_grace_period_seconds = 60

  # task definition revision 변경에만 반응 (image_tag 가 바뀌면 새 revision 생김)
  lifecycle {
    ignore_changes = [desired_count] # auto-scaling 이 관리
  }

  depends_on = [aws_lb_listener.https]

  tags = merge(local.common_tags, { Component = "ecs" })
}

# ---- Auto-scaling ----
resource "aws_appautoscaling_target" "server" {
  max_capacity       = var.service_max_capacity
  min_capacity       = var.service_min_capacity
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.server.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "server_cpu" {
  name               = "${local.name_prefix}-server-cpu60"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.server.resource_id
  scalable_dimension = aws_appautoscaling_target.server.scalable_dimension
  service_namespace  = aws_appautoscaling_target.server.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value       = 60
    scale_in_cooldown  = 120
    scale_out_cooldown = 60

    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
