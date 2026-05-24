output "api_public_ip" {
  value = aws_instance.api_vm.public_ip
}

output "inference_private_ip" {
  value = aws_instance.inference_vm.private_ip
}