# ALB + ACM cert + Route53 + ECS target group
#
# 동작:
#   client → :443 (TLS) → ALB → target group (ip mode) → ECS task
#   :80 → 308 redirect → :443
#
# WebSocket: ALB 는 기본 지원. idle_timeout = 3600 (1시간) 으로 채팅 유지.

# ---- Route53 zone (사전 생성 가정) ----
data "aws_route53_zone" "main" {
  name         = local.parent_zone
  private_zone = false
}

locals {
  # var.domain = "api.sauna.app" → parent zone "sauna.app"
  domain_parts = split(".", var.domain)
  parent_zone  = join(".", slice(local.domain_parts, 1, length(local.domain_parts)))
}

# ---- ACM cert (서울 리전, ALB 와 같은 리전) ----
resource "aws_acm_certificate" "alb" {
  domain_name       = var.domain
  validation_method = "DNS"

  subject_alternative_names = []

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(local.common_tags, { Component = "acm" })
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.alb.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.aws_route53_zone.main.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]

  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "alb" {
  certificate_arn         = aws_acm_certificate.alb.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# ---- ALB (terraform-aws-modules/alb 6.x) ----
resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets

  idle_timeout               = var.alb_idle_timeout_seconds
  enable_http2               = true
  drop_invalid_header_fields = true

  tags = merge(local.common_tags, { Component = "alb" })
}

resource "aws_lb_target_group" "server" {
  name        = "${local.name_prefix}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = module.vpc.vpc_id

  deregistration_delay = 30

  health_check {
    enabled             = true
    path                = "/health"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }

  # WebSocket sticky session 은 보통 불필요 (방 ID 가 식별), 단 stickiness on 으로 안전망
  stickiness {
    type            = "lb_cookie"
    cookie_duration = 3600
    enabled         = false
  }

  tags = merge(local.common_tags, { Component = "alb" })
}

# :80 → :443 redirect
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# :443 → ECS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.alb.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.server.arn
  }
}

# ---- DNS A record ----
resource "aws_route53_record" "alb" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
