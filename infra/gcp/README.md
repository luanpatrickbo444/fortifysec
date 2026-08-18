# FortifySec — infraestrutura base Google Cloud

Terraform cria:

- VPC custom `fortify-range`;
- subnet do gateway `10.80.0.0/24`;
- subnet privada dos labs `10.80.16.0/20`;
- gateway `fortify-range-01` com IP público estático e `can_ip_forward=true`;
- service account do gateway;
- rota `10.77.0.0/16` de retorno para clientes WireGuard;
- firewall UDP/51820, HTTPS/443, SSH via IAP e VPN -> labs.

As VMs criadas pelo provider não recebem IP público e não recebem service account.

## Aplicar

```bash
cp terraform.tfvars.example terraform.tfvars
# editar project_id
terraform init
terraform plan
terraform apply
```

Depois aponte `range.fortifysec.com.br` para `gateway_public_ip`, instale o Range Provider no gateway e configure HTTPS no Nginx.
