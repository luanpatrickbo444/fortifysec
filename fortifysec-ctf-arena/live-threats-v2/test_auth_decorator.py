import importlib.util
from unittest.mock import patch

from flask import Flask

PLUGIN = (
    "/opt/CTFd/CTFd/plugins/"
    "fortifysec_labs_v5/__init__.py"
)

spec = importlib.util.spec_from_file_location(
    "fortifysec_labs_v5_auth_test",
    PLUGIN
)

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

app = Flask("fortifysec-auth-test")
app.secret_key = "temporary-test-only"
app.register_blueprint(module.bp)

# Rota de login fictícia, necessária para verificar
# o redirecionamento produzido pelo decorator.
@app.get("/login", endpoint="auth.login")
def login():
    return "Login de teste"

client = app.test_client()

# Teste 1: requisição JSON sem autenticação
with patch(
    "CTFd.utils.decorators.authed",
    return_value=False
):
    response = client.get(
        "/labs/live-attacks/api/events",
        headers={"Accept": "application/json"},
        json={}
    )

assert response.status_code == 403, (
    f"Esperado HTTP 403, recebido {response.status_code}"
)

print("JSON sem autenticação: HTTP 403 — OK")

# Teste 2: navegação comum sem autenticação
with patch(
    "CTFd.utils.decorators.authed",
    return_value=False
):
    response = client.get(
        "/labs/live-attacks"
    )

assert response.status_code in (301, 302, 303, 307, 308)
assert "/login" in response.headers["Location"]

print("Navegação sem autenticação: redirecionamento — OK")

print("\nDECORATOR ORIGINAL: TESTES APROVADOS")
