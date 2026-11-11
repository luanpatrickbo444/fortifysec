import json, os, re, sqlite3, hashlib
from pathlib import Path
from flask import Flask, abort, render_template

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'data'
SOURCE = Path(os.environ.get('FORTIFYSEC_SOLVES_DB', str(DATA / 'solves.sqlite3')))
USERS = DATA / 'users.json'
app = Flask(__name__)
XP = {'web-auth':100,'api-idor':100,'log-forensics':100,'stored-xss':150,'sql-injection':150,'api-access':150,'jwt-security':150,'linux-audit':150,'network-forensics':150,**{f'fs-{i:03d}':400 for i in range(16,19)},**{f'fs-{i:03d}':600 for i in range(19,22)},**{f'fs-{i:03d}':800 for i in range(22,24)},**{f'fs-{i:03d}':1000 for i in range(24,26)}}
LEVELS = [(8000,'Lendário'),(4000,'Elite'),(1500,'Especialista'),(500,'Explorador'),(0,'Iniciante')]
BADGES = [('Primeira conquista','Conclua seu primeiro laboratório',lambda u: len(u['labs'])>=1,'flag'),('Investigador','Conclua 3 laboratórios',lambda u: len(u['labs'])>=3,'search'),('Persistente','Conclua 5 laboratórios',lambda u: len(u['labs'])>=5,'target'),('Especialista','Alcance 1.500 XP',lambda u: u['xp']>=1500,'shield'),('Elite','Alcance 4.000 XP',lambda u: u['xp']>=4000,'crown'),('Lendário','Alcance 8.000 XP',lambda u: u['xp']>=8000,'zap')]

def standings():
    try:
        names = json.loads(USERS.read_text(encoding='utf-8'))
        if not isinstance(names,dict): names={}
    except (OSError,ValueError): names={}
    people={}
    for ident,name in names.items():
        if re.fullmatch(r'[1-9][0-9]*',str(ident)) and isinstance(name,str) and name.strip():
            people[f'ctfd-{ident}']={'student':f'ctfd-{ident}','id':str(ident),'name':name.strip()[:80],'xp':0,'labs':[]}
    if SOURCE.is_file():
        try:
            with sqlite3.connect(f'file:{SOURCE}?mode=ro',uri=True,timeout=3) as db:
                for student,lab,when in db.execute('SELECT student,lab,solved_at FROM solves ORDER BY solved_at'):
                    person=people.get(student)
                    if person and lab in XP and not any(x['lab']==lab for x in person['labs']):
                        person['xp']+=XP[lab]
                        person['labs'].append({'lab':lab,'xp':XP[lab],'when':when})
        except sqlite3.Error:
            app.logger.exception('Could not read progress snapshot')
    for person in people.values():
        person['level']=next(label for threshold,label in LEVELS if person['xp']>=threshold)
        person['badges']=[{'name':name,'description':description,'icon':icon,'unlocked':bool(rule(person))} for name,description,rule,icon in BADGES]
        person['next_xp']=next((threshold for threshold,_ in reversed(LEVELS) if threshold>person['xp']),None)
        person['progress']=100 if person['next_xp'] is None else min(100,round(100*person['xp']/person['next_xp']))
    return sorted(people.values(),key=lambda u:(-u['xp'],-len(u['labs']),u['name'].casefold()))

def stats(people):
    return {'users':len(people),'solves':sum(len(u['labs']) for u in people),'xp':sum(u['xp'] for u in people)}

@app.get('/')
@app.get('/labs/ranking')
def ranking():
    people=standings()
    return render_template('ranking.html',people=people,stats=stats(people),active='ranking')

@app.get('/labs/perfil')
def profiles():
    people=standings()
    return render_template('profiles.html',people=people,stats=stats(people),active='perfil')

@app.get('/labs/perfil/<int:user_id>')
def profile(user_id):
    people=standings()
    person=next((u for u in people if u['id']==str(user_id)),None)
    if person is None: abort(404)
    return render_template('profile.html',person=person,position=people.index(person)+1,active='perfil')

@app.get('/labs/conquistas')
def achievements():
    people=standings()
    return render_template('achievements.html',people=people,achievements=[{'name':name,'description':desc,'icon':icon,'unlocked':sum(bool(rule(u)) for u in people)} for name,desc,rule,icon in BADGES],active='conquistas')

def dashboard_data(people):
    from collections import Counter
    from datetime import datetime, timezone
    by_lab = Counter(lab['lab'] for person in people for lab in person['labs'])
    by_level = Counter(person['level'] for person in people)
    by_month = Counter()
    for person in people:
        for lab in person['labs']:
            try:
                month = datetime.fromtimestamp(int(lab['when']), tz=timezone.utc).strftime('%Y-%m')
                by_month[month] += 1
            except (ValueError, TypeError, OverflowError, OSError):
                continue
    return {
        'summary': {**stats(people), 'active': sum(bool(p['labs']) for p in people),
                    'average': round(sum(p['xp'] for p in people) / len(people)) if people else 0,
                    'catalog': len(XP)},
        'labs': [{'name': lab, 'count': count} for lab, count in by_lab.most_common(8)],
        'levels': [{'name': name, 'count': by_level.get(name, 0)} for _, name in reversed(LEVELS)],
        'months': [{'name': month, 'count': by_month[month]} for month in sorted(by_month)[-8:]],
        'top': people[:5],
    }

@app.get('/labs/estatisticas')
def dashboard():
    people = standings()
    return render_template('dashboard.html', data=dashboard_data(people), active='estatisticas')

@app.get('/api/progress/version')
def progress_version():
    # Only publish a fingerprint, never expose snapshots or user records.
    parts = []
    for path in (SOURCE, USERS):
        try:
            st = path.stat()
            parts.append(f'{st.st_mtime_ns}:{st.st_size}')
        except OSError:
            parts.append('missing')
    fingerprint = hashlib.sha256('|'.join(parts).encode()).hexdigest()[:20]
    response = app.json.response({'version': fingerprint})
    response.headers['Cache-Control'] = 'no-store'
    return response

@app.get('/health')
def health():
    return {'ok':True,'snapshot_available':SOURCE.is_file(),'users_available':USERS.is_file()}

if __name__=='__main__':
    app.run(host='127.0.0.1',port=int(os.environ.get('PORT','8500')),debug=False)
