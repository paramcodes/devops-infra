variable "aws_region" {
  default = "eu-north-1"
}

variable "key_name" {
  description = "EC2 key pair name"
  type        = string
}

variable "ami_id" {
  default = "ami-042b4708b1d05f512"
}

variable "instance_type" {
  default = "t3.micro"
}