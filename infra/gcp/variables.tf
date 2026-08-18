variable "project_id" { type = string }
variable "region" { type = string; default = "southamerica-east1" }
variable "zone" { type = string; default = "southamerica-east1-b" }
variable "gateway_machine_type" { type = string; default = "e2-small" }
variable "gateway_image" { type = string; default = "projects/ubuntu-os-cloud/global/images/family/ubuntu-2404-lts-amd64" }
variable "range_domain" { type = string; default = "range.fortifysec.com.br" }
