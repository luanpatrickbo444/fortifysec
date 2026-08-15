# Banco legado — próximo passo V7.5

Como as migrations de compatibilidade anteriores já foram aplicadas, não repita a `001_final_schema.sql`.

Execute agora:

1. `migrations/001c_auth_profiles_sync.sql`
2. Confira que `missing_profiles = 0` e `trigger_exists = true`.
3. Execute `ADMIN_VALIDATE_AND_PROMOTE.sql`, trocando o e-mail placeholder.
4. Rode `NOTIFY pgrst, 'reload schema';`.
5. Faça logout e teste `/login` e `/admin/login` em janela anônima.
