# RDS Postgres 16
#
# 저장 데이터: Passkey credentials, 시즌 방 메타. 메시지는 절대 저장 안 함.
# - dev: db.t4g.micro, single-AZ, backup 1일
# - prod: db.t4g.small, Multi-AZ, backup 7일

# 마스터 패스워드 — random + Secrets Manager 보관
resource "random_password" "db_master" {
  length      = 32
  special     = true
  min_special = 4
  # RDS 가 거부하는 문자 제외
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db_master" {
  name        = "${local.name_prefix}-db-master"
  description = "RDS Postgres master credentials"
  tags        = local.common_tags
}

resource "aws_secretsmanager_secret_version" "db_master" {
  secret_id = aws_secretsmanager_secret.db_master.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_master.result
  })
}

# 서브넷 그룹 — private subnets only
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db"
  subnet_ids = module.vpc.private_subnets
  tags       = merge(local.common_tags, { Component = "rds" })
}

# 파라미터 그룹 — KST + utf8
resource "aws_db_parameter_group" "postgres16" {
  name   = "${local.name_prefix}-pg16"
  family = "postgres16"

  parameter {
    name  = "timezone"
    value = "Asia/Seoul"
  }

  tags = merge(local.common_tags, { Component = "rds" })
}

resource "aws_db_instance" "postgres" {
  identifier     = "${local.name_prefix}-postgres"
  engine         = "postgres"
  engine_version = "16.4"

  instance_class    = local.is_prod ? "db.t4g.small" : "db.t4g.micro"
  allocated_storage = var.db_allocated_storage_gb
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_master.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.postgres16.name

  multi_az                = local.is_prod
  publicly_accessible     = false
  backup_retention_period = local.is_prod ? 7 : var.db_backup_retention_days
  backup_window           = "18:00-19:00" # UTC = KST 03:00
  maintenance_window      = "tue:19:00-tue:20:00"

  performance_insights_enabled = local.is_prod
  deletion_protection          = local.is_prod
  skip_final_snapshot          = !local.is_prod
  final_snapshot_identifier    = local.is_prod ? "${local.name_prefix}-postgres-final" : null

  apply_immediately = !local.is_prod

  tags = merge(local.common_tags, { Component = "rds" })
}
