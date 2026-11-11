from flask import Blueprint, render_template_string
from CTFd.utils.decorators import authed_only

bp = Blueprint("fortifysec_live_attacks", __name__)

PAGE = """
{% extends "base.html" %}
{% block content %}
<div style="min-height:85vh;background:#09070a;color:#f5e8ec;padding:40px 5%">
  <div style="max-width:1400px;margin:auto">
    <p style="color:#ff3658;letter-spacing:4px;font-weight:700">
      FORTIFYSEC // THREAT INTELLIGENCE
    </p>
    <h1 style="font-size:clamp(32px,5vw,64px);font-weight:900">
      LIVE <span style="color:#ff2449">ATTACKS</span>
    </h1>
    <p style="color:#a99aa1">
      Monitoramento em tempo real dos laboratórios FortifySec.
    </p>
    <div style="border:1px solid #53202c;border-radius:16px;
                background:#120b10;padding:32px;margin-top:32px;
                min-height:300px;display:grid;place-items:center">
      <div style="text-align:center">
        <div style="font-size:54px;color:#ff2449">◎</div>
        <h3>AGUARDANDO TELEMETRIA</h3>
        <p style="color:#a99aa1">
          A conexão com os eventos reais ainda não foi habilitada.
        </p>
      </div>
    </div>
    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:24px">
      <a href="/challenges" style="color:#ff526d">Desafios</a>
      <a href="/scoreboard" style="color:#ff526d">Ranking CTF</a>
      <a href="/labs/" style="color:#ff526d">Laboratórios</a>
    </div>
  </div>
</div>
{% endblock %}
"""

@bp.get("/live-attacks")
@authed_only
def live_attacks():
    return render_template_string(PAGE)

def load(app):
    app.register_blueprint(bp)
