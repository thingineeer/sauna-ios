# VPC + 2 public + 2 private + IGW + NAT
#
# 운영 절약: dev 환경은 single_nat_gateway = true (NAT 1개), prod 는 AZ별.

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.13"

  name = "${local.name_prefix}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  public_subnets  = var.public_subnet_cidrs
  private_subnets = var.private_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = !local.is_prod
  one_nat_gateway_per_az = local.is_prod
  enable_dns_hostnames   = true
  enable_dns_support     = true

  # ELB 자동탐지용 서브넷 태그
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
    Tier                     = "public"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
    Tier                              = "private"
  }

  tags = local.common_tags
}
