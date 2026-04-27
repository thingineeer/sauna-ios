# ECR — SaunaServer 컨테이너 이미지 레지스트리
#
# CI (GitHub Actions) 가 push 함:
#   docker build -t <repo>:$GIT_SHA . && docker push <repo>:$GIT_SHA
#   terraform apply -var "image_tag=$GIT_SHA"

resource "aws_ecr_repository" "server" {
  name                 = "${local.name}-server"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = merge(local.common_tags, {
    Component = "ecr"
  })
}

# 라이프사이클 — 오래된/태그 없는 이미지 정리
resource "aws_ecr_lifecycle_policy" "server" {
  repository = aws_ecr_repository.server.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 tagged images"
        selection = {
          tagStatus      = "tagged"
          tagPatternList = ["*"]
          countType      = "imageCountMoreThan"
          countNumber    = 30
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Expire untagged after 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      },
    ]
  })
}
