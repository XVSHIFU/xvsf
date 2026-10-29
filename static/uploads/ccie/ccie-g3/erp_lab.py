"""Small authenticated SQLite order service for the EVE migration exercise."""
import base64
import hashlib
import hmac
import json
import os
import sqlite3
import ssl
import sys
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(sys.argv[1])
SITE = sys.argv[2]
DB = ROOT / SITE / 'orders.sqlite'
CREDS = json.loads((ROOT / 'credentials.json').read_text())
AUTH = 'Basic ' + base64.b64encode((CREDS['user']+':'+CREDS['password']).encode()).decode()

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def audit(self, status):
        with (ROOT / SITE / 'audit.jsonl').open('a') as f:
            f.write(json.dumps({'time':datetime.now(timezone.utc).isoformat(),
                'client':self.client_address[0], 'method':self.command,
                'path':self.path, 'status':status, 'site':SITE})+'\n')

    def reply(self, status, data):
        raw=json.dumps(data,ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(raw)))
        self.send_header('Cache-Control','no-store')
        self.end_headers(); self.wfile.write(raw); self.audit(status)

    def do_GET(self):
        if not hmac.compare_digest(self.headers.get('Authorization',''), AUTH):
            return self.reply(401,{'error':'authentication required'})
        if self.path != '/api/orders':
            return self.reply(404,{'error':'not found'})
        mode=(ROOT / SITE / 'mode').read_text().strip()
        if mode == 'proxy-cloud':
            try:
                req=urllib.request.Request('https://10.3.101.20:8443/api/orders',headers={'Authorization':AUTH})
                with urllib.request.urlopen(req,context=ssl.create_default_context(cafile=str(ROOT/'server.crt')),timeout=6) as r:
                    data=json.load(r)
                data['entrypoint']='dc-stable-url'
                return self.reply(200,data)
            except Exception as e:
                return self.reply(502,{'error':type(e).__name__})
        with sqlite3.connect(DB) as c:
            rows=c.execute('SELECT id, customer, item, quantity FROM orders ORDER BY id').fetchall()
        digest=hashlib.sha256(json.dumps(rows,separators=(',',':')).encode()).hexdigest()
        self.reply(200,{'backend':SITE,'order_count':len(rows),'data_sha256':digest,'orders':rows})

context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.minimum_version=ssl.TLSVersion.TLSv1_2
context.load_cert_chain(str(ROOT/'server.crt'),str(ROOT/'server.key'))
server=ThreadingHTTPServer(('0.0.0.0',8443),Handler)
server.socket=context.wrap_socket(server.socket,server_side=True)
server.serve_forever()
