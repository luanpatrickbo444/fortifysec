# FortifySec — Google Cloud Cyber Range

## Arquitetura

```text
FortifySec / Vercel
        |
        | HTTPS + Bearer token
        v
range.fortifysec.com.br
        |
        v
fortify-range-01 (Compute Engine gateway)
  - Range Provider
  - WireGuard 10.77.0.1/16
  - IP forwarding
        |
        +---- VPC fortify-range 10.80.0.0/16
                 |
                 +---- fortify-labs 10.80.16.0/20
                        |-- VM Lab A (private IP only)
                        |-- VM Lab B (private IP only)
                        +-- VM Lab C (private IP only)
```

## Contrato com o site

O Next.js continua usando:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=<MESMO PROVIDER_API_KEY DO GATEWAY>
```

Nenhuma alteração de contrato é necessária no Supabase ou nas Server Actions.

## Autenticação no Google Cloud

O provider usa `@google-cloud/compute` e Application Default Credentials. Em produção, a credencial vem da service account anexada ao gateway. Não armazene chave JSON de service account no repositório ou no servidor.

## Isolamento

- VMs de Lab sem IP público;
- VMs de Lab sem service account;
- custom VPC sem regra `allow-internal` genérica;
- firewall permite entrada nos labs apenas da faixa WireGuard `10.77.0.0/16`;
- iptables no gateway restringe cada peer à VM `/32` da própria sessão;
- TTL e sweep removem VMs expiradas;
- disco de boot usa `autoDelete=true`.

## Imagens de Lab

O smoke test pode usar Debian 12 e SSH. Labs reais devem preferir imagens próprias pré-configuradas, por exemplo:

```json
{
  "web-juice-01": {
    "provider": "gcp_vm",
    "source_image": "projects/SEU_PROJETO/global/images/fortify-juice-shop-v1",
    "machine_type": "e2-small",
    "scheme": "http",
    "port": 3000,
    "ready_port": 3000,
    "ttl_minutes": 60
  }
}
```

Isso evita que uma VM propositalmente vulnerável precise baixar pacotes ou containers da Internet durante a sessão.
