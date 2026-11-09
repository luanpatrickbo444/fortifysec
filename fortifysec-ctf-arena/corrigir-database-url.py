import os
from urllib.parse import quote
from sqlalchemy.engine.url import make_url

url = os.environ["DATABASE_URL"]

# Corrige o caso específico em que a senha contém
# um @ não codificado, fazendo o host virar @db.
parsed = make_url(url)

if parsed.host == "@db":
    prefix, remainder = url.split("://", 1)
    credentials, host_and_path = remainder.rsplit("@db", 1)

    username, password = credentials.split(":", 1)

    corrected = (
        prefix + "://"
        + quote(username, safe="")
        + ":"
        + quote(password, safe="")
        + "@db"
        + host_and_path
    )

    check = make_url(corrected)

    if check.host != "db":
        raise RuntimeError("Host incorreto após correção")

    print(corrected)
else:
    raise RuntimeError(
        "Formato diferente do esperado. Nenhuma alteração realizada."
    )
