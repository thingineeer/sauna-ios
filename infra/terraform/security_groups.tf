# 보안 그룹
#
# 흐름:
#   internet → ALB(80/443) → ECS task(container_port) → RDS(5432) / Redis(6379)

# ---- ALB ----
resource "aws_security_group" "alb" {
  name        = "${local.name_prefix}-alb"
  description = "Public ingress 80/443 to ALB"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.common_tags, { Component = "alb" })
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTP (redirect to HTTPS)"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  security_group_id = aws_security_group.alb.id
  description       = "HTTPS"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_egress_all" {
  security_group_id = aws_security_group.alb.id
  description       = "Allow all egress"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ---- ECS task ----
resource "aws_security_group" "ecs_task" {
  name        = "${local.name_prefix}-ecs-task"
  description = "Fargate task — only ALB ingress"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.common_tags, { Component = "ecs" })
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id            = aws_security_group.ecs_task.id
  description                  = "App port from ALB"
  from_port                    = var.container_port
  to_port                      = var.container_port
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.alb.id
}

resource "aws_vpc_security_group_egress_rule" "ecs_egress_all" {
  security_group_id = aws_security_group.ecs_task.id
  description       = "All egress (NAT → internet, RDS, Redis)"
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

# ---- RDS ----
resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds"
  description = "Postgres — only ECS task ingress"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.common_tags, { Component = "rds" })
}

resource "aws_vpc_security_group_ingress_rule" "rds_from_ecs" {
  security_group_id            = aws_security_group.rds.id
  description                  = "Postgres from ECS task"
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_task.id
}

# ---- ElastiCache (Redis) ----
resource "aws_security_group" "redis" {
  name        = "${local.name_prefix}-redis"
  description = "Redis — only ECS task ingress"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.common_tags, { Component = "redis" })
}

resource "aws_vpc_security_group_ingress_rule" "redis_from_ecs" {
  security_group_id            = aws_security_group.redis.id
  description                  = "Redis from ECS task"
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
  referenced_security_group_id = aws_security_group.ecs_task.id
}
