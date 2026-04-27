# ElastiCache Redis 7
#
# 사용처: Pub/Sub (방 채널 broadcast) + presence HASH.
# - dev: 단일 노드 t4g.micro, 영속 X
# - prod: replication group (primary + 1 replica), multi-AZ, AUTH token

# Subnet group
resource "aws_elasticache_subnet_group" "main" {
  name       = "${local.name_prefix}-redis"
  subnet_ids = module.vpc.private_subnets
  tags       = merge(local.common_tags, { Component = "redis" })
}

# 파라미터 그룹 — Pub/Sub 최적화 + 휘발 유지
resource "aws_elasticache_parameter_group" "redis7" {
  name   = "${local.name_prefix}-redis7"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  tags = merge(local.common_tags, { Component = "redis" })
}

# AUTH 토큰 (prod 전용)
resource "random_password" "redis_auth" {
  count   = local.is_prod ? 1 : 0
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "redis_auth" {
  count       = local.is_prod ? 1 : 0
  name        = "${local.name_prefix}-redis-auth"
  description = "ElastiCache Redis AUTH token"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "redis_auth" {
  count         = local.is_prod ? 1 : 0
  secret_id     = aws_secretsmanager_secret.redis_auth[0].id
  secret_string = random_password.redis_auth[0].result
}

# ---- dev: 단일 cluster ----
resource "aws_elasticache_cluster" "dev" {
  count = local.is_prod ? 0 : 1

  cluster_id           = "${local.name_prefix}-redis"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = aws_elasticache_parameter_group.redis7.name
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  snapshot_retention_limit = 0 # 휘발 유지

  tags = merge(local.common_tags, { Component = "redis" })
}

# ---- prod: replication group ----
resource "aws_elasticache_replication_group" "prod" {
  count = local.is_prod ? 1 : 0

  replication_group_id = "${local.name_prefix}-redis"
  description          = "Sauna Redis Pub/Sub + presence (prod)"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type

  num_cache_clusters         = 2 # primary + 1 replica
  automatic_failover_enabled = true
  multi_az_enabled           = true

  parameter_group_name = aws_elasticache_parameter_group.redis7.name
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth[0].result

  snapshot_retention_limit = 0
  apply_immediately        = false

  tags = merge(local.common_tags, { Component = "redis" })
}
