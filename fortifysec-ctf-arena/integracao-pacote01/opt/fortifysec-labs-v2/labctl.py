#!/usr/bin/env python3
"""FortifySec Labs v2: local-only pilot lifecycle CLI. No CTFd modifications."""
import argparse, datetime, json, re, secrets, subprocess, sys, time
from pathlib import Path

IMAGES = {'web-auth': 'fortifysec-training-labs-web-auth', 'api-idor': 'fortifysec-training-labs-api-idor', 'log-forensics': 'fortifysec-training-labs-log-forensics'}
PREFIX = 'fs-v2-'
# Pacote 01: imagens geradas pelo Compose e flags lidas localmente.
PACK1 = {'sql-injection': ('fortifysec-training-pack1-lab01', 'sql-injection', 'LAB01_FLAG'), 'stored-xss': ('fortifysec-training-pack1-lab02', 'stored-xss', 'LAB02_FLAG'), 'api-access': ('fortifysec-training-pack1-lab03', 'api-access', 'LAB03_FLAG'), 'jwt-security': ('fortifysec-training-pack1-lab04', 'jwt-security', 'LAB04_FLAG'), 'linux-audit': ('fortifysec-training-pack1-lab05', 'linux-audit', 'LAB05_FLAG'), 'network-forensics': ('fortifysec-training-pack1-lab06', 'network-forensics', 'LAB06_FLAG')}
FLAGS_FILE = Path('/home/kali/Documents/fortifysec/fortifysec-ctf-arena/fortifysec-labs-01-06/.env')

def read_pack1_flag(name):
    if not FLAGS_FILE.is_file():
        raise RuntimeError('Arquivo .env dos labs não encontrado')
    import stat
    if FLAGS_FILE.stat().st_mode & 0o077:
        raise RuntimeError('Proteja .env com chmod 600 antes de iniciar')
    values = {}
    for line in FLAGS_FILE.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        values[k.strip()] = v.strip().strip('\"').strip("'")
    value = values.get(name, '')
    if not value or len(value) > 200 or '\n' in value:
        raise RuntimeError('Flag inválida ou ausente: ' + name)
    return value


def docker(*args, check=True):
    p = subprocess.run(['docker', *args], text=True, capture_output=True)
    if check and p.returncode:
        raise RuntimeError((p.stderr or p.stdout).strip())
    return p.stdout.strip()

def containers():
    ids = docker('ps', '-aq', '--filter', 'label=fortifysec.lab.v2=true').splitlines()
    if not ids: return []
    return json.loads(docker('inspect', *ids))

def cleanup():
    now = int(time.time()); removed = 0
    for c in containers():
        labels = c['Config'].get('Labels') or {}
        try: expires = int(labels.get('fortifysec.expires', '0'))
        except ValueError: expires = 0
        if expires and expires <= now:
            name = c['Name'].lstrip('/')
            docker('rm', '-f', name)
            network = labels.get('fortifysec.network', '')
            if network.startswith(PREFIX): docker('network', 'rm', network, check=False)
            print('Expirado e removido:', name); removed += 1
    return removed

def start(args):
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,48}', args.student):
        raise ValueError('Identificador do aluno inválido; use letras, números, _ ou -')
    cleanup()
    owned = [c for c in containers() if (c['Config'].get('Labels') or {}).get('fortifysec.student') == args.student]
    if owned:
        raise ValueError('Aluno já possui laboratório ativo. Encerre-o antes de iniciar outro.')
    if len(containers()) >= args.max_sessions:
        raise ValueError('Limite de sessões simultâneas atingido')
    image = IMAGES.get(args.lab) or PACK1[args.lab][0]
    extra_env = []
    internal_port = 8000
    if args.lab in PACK1:
        _, lab_id, flag_name = PACK1[args.lab]
        extra_env = ['--env', 'LAB_ID=' + lab_id, '--env', 'LAB_FLAG=' + read_pack1_flag(flag_name)]
        internal_port = 8080
    docker('image', 'inspect', image)
    suffix = secrets.token_hex(6)
    name = PREFIX + suffix
    net = name
    expiry = int(time.time()) + args.minutes * 60
    docker('network', 'create', '--driver', 'bridge', '--label', 'fortifysec.lab.v2=true', net)
    try:
        docker('run', '-d', '--name', name, '--network', net,
               '-p', '127.0.0.1::'+str(internal_port), '--read-only', '--tmpfs', '/tmp:rw,nosuid,nodev,size=16m',
               '--security-opt', 'no-new-privileges', '--cap-drop', 'ALL', '--pids-limit', '80',
               '--memory', '128m', '--cpus', '0.5', '--restart', 'no',
               '--label', 'fortifysec.lab.v2=true',
               '--label', 'fortifysec.student='+args.student,
               '--label', 'fortifysec.lab='+args.lab,
               '--label', 'fortifysec.expires='+str(expiry),
               '--label', 'fortifysec.network='+net,
               *extra_env, image)
    except Exception:
        docker('network', 'rm', net, check=False)
        raise
    ports = docker('port', name, str(internal_port)+'/tcp')
    print(json.dumps({'container':name,'student':args.student,'lab':args.lab,'local_url':'http://'+ports.splitlines()[0], 'expires_utc':datetime.datetime.fromtimestamp(expiry,datetime.timezone.utc).isoformat()},indent=2))

def list_labs(_):
    for c in containers():
        lab = c['Config'].get('Labels') or {}
        print(c['Name'].lstrip('/'), 'student='+lab.get('fortifysec.student','?'), 'lab='+lab.get('fortifysec.lab','?'), 'expires='+lab.get('fortifysec.expires','?'), 'status='+c['State']['Status'])

def stop(args):
    matches = [c for c in containers() if c['Name'].lstrip('/') == args.container and args.container.startswith(PREFIX)]
    if not matches: raise ValueError('Container v2 não encontrado')
    c = matches[0]
    docker('rm','-f',args.container)
    net = (c['Config'].get('Labels') or {}).get('fortifysec.network','')
    if net.startswith(PREFIX): docker('network','rm',net,check=False)
    print('Encerrado:',args.container)

def main():
    p=argparse.ArgumentParser(description='FortifySec Labs v2 (piloto local)')
    sub=p.add_subparsers(dest='command',required=True)
    s=sub.add_parser('start'); s.add_argument('--student',required=True); s.add_argument('--lab',required=True,choices=tuple(IMAGES) + tuple(PACK1)); s.add_argument('--minutes',type=int,default=60,choices=range(5,121)); s.add_argument('--max-sessions',type=int,default=10); s.set_defaults(func=start)
    s=sub.add_parser('list'); s.set_defaults(func=list_labs)
    s=sub.add_parser('stop'); s.add_argument('container'); s.set_defaults(func=stop)
    s=sub.add_parser('cleanup'); s.set_defaults(func=lambda a:cleanup())
    args=p.parse_args()
    try: args.func(args)
    except (RuntimeError,ValueError) as e:
        print('ERRO:',e,file=sys.stderr); sys.exit(1)
if __name__=='__main__': main()
