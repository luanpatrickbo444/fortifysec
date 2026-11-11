import os, sqlite3
from pathlib import Path
from flask import Flask, render_template, abort

app = Flask(__name__)
SOURCE = Path(os.environ.get('FORTIFYSEC_SOLVES_DB', '/var/lib/fortifysec-labs/solves.sqlite3'))
XP = {'web-auth':100,'api-idor':100,'log-forensics':100,'stored-xss':150,'sql-injection':150,'api-access':150,'jwt-security':150,'linux-audit':150,'network-forensics':150, **{f'fs-{i:03d}':400 for i in range(16,19)}, **{f'fs-{i:03d}':600 for i in range(19,22)}, **{f'fs-{i:03d}':800 for i in range(22,24)}, **{f'fs-{i:03d}':1000 for i in range(24,26)}}
LEVELS = [(8000,'Lendário'),(4000,'Elite'),(1500,'Especialista'),(500,'Explorador'),(0,'Iniciante')]

def records():
    if not SOURCE.is_file():
        return []
    uri = f'file:{SOURCE}?mode=ro'
    with sqlite3.connect(uri, uri=True, timeout=3) as db:
        return db.execute('SELECT student,lab,solved_at FROM solves ORDER BY solved_at').fetchall()

def standings():
    users={}
    for student, lab, when in records():
        if not student.startswith('ctfd-') or not student[5:].isdigit():
            continue
        user=users.setdefault(student,{'student':student,'xp':0,'labs':[]})
        if lab in XP and lab not in [x['lab'] for x in user['labs']]:
            user['xp']+=XP[lab]
            user['labs'].append({'lab':lab,'xp':XP[lab],'when':when})
    for user in users.values():
        user['level']=next(label for threshold,label in LEVELS if user['xp']>=threshold)
        user['achievements']=[a for a,condition in [('Primeiro laboratório',len(user['labs'])>=1),('Cinco laboratórios',len(user['labs'])>=5),('Especialista',user['xp']>=1500),('Elite',user['xp']>=4000)] if condition]
    return sorted(users.values(),key=lambda u:(-u['xp'],u['student']))

@app.get('/')
def index():
    return render_template('ranking.html', users=standings())

@app.get('/labs/ranking')
def ranking():
    return render_template('ranking.html', users=standings())

# Public prototype: only aggregate leaderboard. No individual profile or history is exposed
# until authenticated access is integrated.
@app.get('/labs/perfil')
def profile():
    return render_template('restricted.html', title='Meu perfil', message='O perfil individual será ativado após integrar autenticação segura.')

@app.get('/labs/conquistas')
def achievements():
    return render_template('restricted.html', title='Conquistas', message='As conquistas individuais serão exibidas após integrar autenticação segura.')

@app.get('/health')
def health():
    return {'ok':True, 'source_available':SOURCE.is_file()}

if __name__=='__main__':
    app.run(host='127.0.0.1',port=8500)
