#!/usr/bin/env python3
"""Importador FortifySec Elite Labs para CTFd. Não modifica banco/volumes."""
import argparse
import io
import json
import os
import sys
import zipfile
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit('Instale a dependência: python3 -m pip install requests')

LABS = [
    ('FS-001', 'Tenant Escape', 'Web', 450, 'FS-001-tenant-escape.zip'),
    ('FS-002', 'Stream Reuse', 'Crypto', 500, 'FS-002-stream-reuse.zip'),
    ('FS-003', 'Incident Timeline', 'Forensics', 500, 'FS-003-incident-timeline.zip'),
    ('FS-004', 'ELF Keycheck', 'Reverse', 550, 'FS-004-elf-keycheck.zip'),
    ('FS-005', 'Stack Gate', 'Pwn', 600, 'FS-005-stack-gate.zip'),
    ('FS-006', 'DNS Fragments', 'Networks', 450, 'FS-006-dns-fragments.zip'),
]

class ApiError(Exception):
    pass

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pacote', required=True, help='ZIP original FortifySec Elite Labs')
    ap.add_argument('--url', default='http://127.0.0.1:8000')
    ap.add_argument('--aplicar', action='store_true', help='Sem esta opção, apenas valida arquivos')
    ap.add_argument('--sem-arquivos', action='store_true', help='Cadastra sem anexar ZIPs')
    args = ap.parse_args()
    p = Path(args.pacote).expanduser().resolve()
    if not p.is_file():
        sys.exit(f'Pacote não encontrado: {p}')
    with zipfile.ZipFile(p) as z:
        if z.testzip() is not None:
            sys.exit('Arquivo ZIP corrompido')
        keys = json.loads(z.read('ADMIN_PRIVADO/gabarito.json'))
        flags = {x['id']: x['flag'] for x in keys}
        prepared = []
        for lab_id, title, category, value, filename in LABS:
            raw = z.read('PARTICIPANTES/' + filename)
            with zipfile.ZipFile(io.BytesIO(raw)) as inner:
                if inner.testzip() is not None:
                    sys.exit(f'ZIP interno inválido: {filename}')
                readme = inner.read('README.md').decode('utf-8')
            if not flags.get(lab_id):
                sys.exit(f'Flag ausente: {lab_id}')
            prepared.append((lab_id, title, category, value, filename, readme, raw))
    print(f'Validação local: {len(prepared)} laboratórios e flags presentes.')
    if not args.aplicar:
        for lab_id, title, category, value, filename, _, raw in prepared:
            print(f'  {lab_id} | {category:10} | {value:3} pts | {filename} ({len(raw)} bytes)')
        print('MODO SIMULAÇÃO: nenhuma alteração no CTFd. Use --aplicar para importar.')
        return

    token = os.environ.get('CTFD_ADMIN_TOKEN', '').strip()
    if not token:
        sys.exit('Defina CTFD_ADMIN_TOKEN no ambiente (token administrativo do CTFd).')
    base = args.url.rstrip('/') + '/api/v1'
    if not base.startswith(('http://127.0.0.1:', 'http://localhost:', 'https://')):
        sys.exit('Use HTTPS para servidor remoto; HTTP apenas localhost.')
    session = requests.Session()
    session.headers.update({'Authorization': 'Token ' + token, 'Accept': 'application/json'})

    def request(method, endpoint, **kwargs):
        try:
            r = session.request(method, base + endpoint, timeout=30, **kwargs)
        except requests.RequestException as exc:
            raise ApiError(f'Falha de conexão: {exc}') from exc
        try:
            body = r.json()
        except ValueError:
            raise ApiError(f'{method} {endpoint}: HTTP {r.status_code}, resposta não JSON')
        if not r.ok or body.get('success') is False:
            details = body.get('errors') or body.get('message') or r.reason
            raise ApiError(f'{method} {endpoint}: HTTP {r.status_code} - {details}')
        return body

    try:
        listing = request('GET', '/challenges', params={'view': 'admin'})
        existing = {x['name']: x for x in listing.get('data', [])}
        for lab_id, title, category, value, filename, readme, raw in prepared:
            name = f'{lab_id} — {title}'
            if name in existing:
                print(f'IGNORADO (já existe): {name}. Confira flags e anexos manualmente.')
                continue
            print(f'CRIANDO: {name}')
            description = (f'**Laboratório FortifySec Elite Labs**\n\n'
                           f'{readme}\n\n'
                           f'Baixe o arquivo anexo e resolva em VM/container isolado. '
                           f'Não execute binários vulneráveis no host do CTFd.')
            created = request('POST', '/challenges', json={
                'name': name, 'category': category, 'description': description,
                'value': value, 'type': 'standard', 'state': 'hidden',
                'max_attempts': 0,
            })
            challenge_id = created['data']['id']
            print(f'  ID {challenge_id} — oculto')
            request('POST', '/flags', json={
                'challenge_id': challenge_id, 'content': flags[lab_id], 'type': 'static',
            })
            print('  Flag cadastrada')
            if not args.sem_arquivos:
                # API de arquivos do CTFd: upload multipart + tipo challenge + challenge_id.
                request('POST', '/files', data={
                    'type': 'challenge', 'challenge_id': str(challenge_id),
                }, files={'file': (filename, io.BytesIO(raw), 'application/zip')})
                print('  ZIP anexado')
        print('\nImportação concluída. Desafios permanecem OCULTOS.')
        print('Revise anexos, flags e visualização no painel Admin antes de publicar.')
    except ApiError as exc:
        sys.exit(f'ERRO: {exc}\nA importação pode ter sido parcial. Não apague dados; confira o Admin.')

if __name__ == '__main__':
    main()
