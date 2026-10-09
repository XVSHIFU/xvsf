import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { startPreviewService } from './preview-server.mjs';
import { buildWorkbench, browserFiles, workspaceRoot } from '../scripts/build-workbench.mjs';

const root = path.join(workspaceRoot, 'tmp', 'workbench-public');
await buildWorkbench(root, { local: true });
const blogStatic = path.join(workspaceRoot, 'static');
const port = Number(process.env.WORKBENCH_PORT || 4319);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.mjs': 'text/javascript', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2', '.wasm': 'application/wasm' };
const publicFiles = new Set(browserFiles);
const preview = await startPreviewService(workspaceRoot, path.join(workspaceRoot, 'tmp', 'workbench-preview'));
const previewToken = randomBytes(32).toString('hex');
const origin = `http://127.0.0.1:${port}`;
const json = (response, status, value) => { response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end(JSON.stringify(value)); };
http.createServer(async (request, response) => {
  try {
    if (request.headers.host !== `127.0.0.1:${port}`) { response.writeHead(403); response.end(); return; }
    const route = new URL(request.url, origin).pathname;
    if (route === '/api/preview-session' && request.method === 'GET') { json(response, 200, { token: previewToken }); return; }
    if (route === '/api/preview' && request.method === 'POST') {
      if (request.headers.origin !== origin || request.headers['x-workbench-token'] !== previewToken || !request.headers['content-type']?.startsWith('application/json')) { json(response, 403, { error: '请从本地工作区发起预览。' }); return; }
      const chunks = []; let size = 0;
      for await (const chunk of request) { size += chunk.length; if (size > 13 * 1024 * 1024) { json(response, 413, { error: '预览内容过大，单篇不超过 2 MB。' }); return; } chunks.push(chunk); }
      try { json(response, 200, await preview.create(JSON.parse(Buffer.concat(chunks).toString('utf8')).raw)); }
      catch (error) { json(response, error.status || 400, { error: error.message }); }
      return;
    }
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const url = new URL(request.url, 'http://localhost');
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    let base = root;
    if (relative.startsWith('xvsf/')) { base = blogStatic; relative = relative.slice(5); }
    else if (/^(uploads|images|img)\//.test(relative)) base = blogStatic;
    else if (publicFiles.has(relative)) base = path.join(workspaceRoot, 'workbench');
    else if (!publicFiles.has(relative) && !relative.startsWith('vendor/vditor/dist/') && !relative.startsWith('vendor/yaml/browser/') && !relative.startsWith('data/')) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const filename = path.resolve(base, relative);
    if (!filename.startsWith(base + path.sep) || !(await stat(filename)).isFile()) throw new Error('Not found');
    response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache', 'Referrer-Policy': 'no-referrer' });
    let body = request.method === 'HEAD' ? undefined : await readFile(filename);
    // The public page only embeds its sandboxed Markdown preview. Local Hugo
    // previews run on a separate loopback origin, allowed only by this server.
    if (body && publicFiles.has(relative) && relative === 'index.html') body = body.toString('utf8').replace("frame-src 'self'", `frame-src 'self' http://127.0.0.1:${preview.server.address().port}`);
    response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`Writing workbench: http://127.0.0.1:${port}/`));
