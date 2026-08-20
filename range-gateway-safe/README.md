# FortifySec Range Gateway — SAFE

Gateway opcional para vários Range Providers. A aplicação Next.js continua usando o mesmo contrato `/sessions` e não precisa de nenhuma alteração visual ou em `app/actions.ts`.

Na Vercel:

```env
LAB_PROVIDER_API_URL=https://range.fortifysec.com.br
LAB_PROVIDER_API_KEY=<GATEWAY_API_KEY>
```

No gateway:

```env
GATEWAY_API_KEY=<mesma chave usada pela Vercel>
RANGE_PROVIDER_API_KEY=<chave compartilhada pelos nodes>
RANGE_PROVIDER_URLS=https://range-01.internal,https://range-02.internal
```

O gateway consulta `/stats`, escolhe o node com menor utilização e guarda o mapeamento `session_id -> node` para destruir a sessão no mesmo node.
