import importlib.util
from flask import Flask, Blueprint

PLUGIN = "/opt/CTFd/CTFd/plugins/fortifysec_labs_v5/__init__.py"

spec = importlib.util.spec_from_file_location("fortifysec_v2_http_test", PLUGIN)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

app = Flask("fortifysec-v2-http-test")
app.secret_key = "temporary-local-test-only"

auth = Blueprint("auth", __name__)

@auth.get("/login")
def login():
    return "Login de teste — nenhuma autenticação real disponível"

app.register_blueprint(auth)
module.load(app)

@app.get("/health")
def health():
    return {"success": True, "mode": "isolated-test"}


# Prévia visual exclusiva do ambiente temporário.
# Não altera as rotas autenticadas do plugin.
@app.get("/preview/live-attacks")
def preview_live_attacks():
    from flask import render_template_string

    return render_template_string(
        module.PAGE.replace(
            "/labs/live-attacks/api/events",
            "/preview/api/events"
        ),
        page="live",
        title="LIVE <em>ATTACKS</em>",
        description="Prévia visual isolada — sem telemetria de produção.",
        section="Feed de atividade"
    )


@app.get("/preview/api/events")
def preview_events():
    from flask import jsonify
    response = jsonify(
        success=True,
        data={
            "events": [],
            "total": 0,
            "last_minute": 0,
            "active_students": 0
        }
    )
    response.headers["Cache-Control"] = "no-store"
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
