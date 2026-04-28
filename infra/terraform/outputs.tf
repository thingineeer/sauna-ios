# 출력 — CI/CD 가 읽거나 운영자가 확인.

output "alb_dns_name" {
  description = "ALB DNS 이름. Route53 alias 가 가리킴."
  value       = aws_lb.main.dns_name
}

output "alb_url" {
  description = "공개 엔드포인트 URL"
  value       = "https://${var.domain}"
}

output "redis_endpoint" {
  description = "Redis primary endpoint (host:port). dev=cluster node, prod=replication group primary."
  value       = local.is_prod ? "${try(aws_elasticache_replication_group.prod[0].primary_endpoint_address, "")}:6379" : "${try(aws_elasticache_cluster.dev[0].cache_nodes[0].address, "")}:6379"
}

output "db_endpoint" {
  description = "RDS Postgres endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "db_secret_arn" {
  description = "Secrets Manager — DB 마스터 자격증명 ARN"
  value       = aws_secretsmanager_secret.db_master.arn
  sensitive   = true
}

output "ecr_repository_url" {
  description = "ECR repo URL — CI 가 docker push 대상"
  value       = aws_ecr_repository.server.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster 이름"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service 이름"
  value       = aws_ecs_service.server.name
}

output "log_group_name" {
  description = "CloudWatch Logs group"
  value       = aws_cloudwatch_log_group.server.name
}
