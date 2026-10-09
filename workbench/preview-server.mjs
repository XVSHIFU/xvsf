import http from 'node:http';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { cp, mkdir, readFile, writeFile, stat, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readMetadata, splitMarkdown, writeMetadata } from './model.mjs';
import { MAX_DOCUMENT_BYTES } from './workspace-model.mjs';

const run = promisify(execFile);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
export async function startPreviewService(blog, jobsRoot) {
  const jobs = new Map(); let busy = false;
  const server = http.createServer(async (request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('Content-Security-Policy', "sandbox allow-scripts allow-same-origin; frame-src 'none'; object-src 'none'; form-action 'none'; connect-src 'self'");
    try {
      if (request.headers.host !== `127.0.0.1:${server.address().port}` || !['GET', 'HEAD'].includes(request.method)) { response.writeHead(403); response.end(); return; }
      const pathname = new URL(request.url, 'http://localhost').pathname;
      const match = pathname.match(/^\/([a-f0-9-]+)\/xvsf\/(.*)$/);
      let bases, relative;
      if (match && jobs.has(match[1])) {
        bases = [path.join(jobs.get(match[1]), 'public'), path.join(blog, 'static')]; relative = decodeURIComponent(match[2]);
      } else if (pathname.startsWith('/xvsf/') || /^\/(uploads|images|img)\//.test(pathname)) {
        bases = [path.join(blog, 'static')]; relative = decodeURIComponent(pathname.replace(/^\/(?:xvsf\/)?/, ''));
      } else throw new Error('Missing preview');
      if (!relative || relative.endsWith('/')) relative += 'index.html';
      if (relative.includes('\\') || relative.includes('\0')) throw new Error('Invalid path');
      let filename;
      for (const base of bases) {
        const candidate = path.resolve(base, relative);
        if (!candidate.startsWith(base + path.sep)) continue;
        if (await stat(candidate).then(value => value.isFile()).catch(() => false)) { filename = candidate; break; }
      }
      if (!filename) throw new Error('Missing file');
      response.writeHead(200, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(filename));
    } catch { response.writeHead(404); response.end('预览已过期或此资源不存在，请回到工作区重新生成。'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  async function removeJob(directory) {
    const target = path.resolve(directory), allowed = path.resolve(jobsRoot);
    if (!target.startsWith(allowed + path.sep) || !/^[a-f0-9-]+$/.test(path.basename(target))) throw new Error('Invalid preview cleanup target');
    await rm(target, { recursive: true, force: true });
  }
  return {
    server,
    async create(raw) {
      if (busy) throw Object.assign(new Error('另一篇预览正在生成，请稍后重试。'), { status: 409 });
      if (typeof raw !== 'string' || Buffer.byteLength(raw) > MAX_DOCUMENT_BYTES || !splitMarkdown(raw).prefix) throw Object.assign(new Error('预览需要包含文章属性的 Markdown，单篇不超过 2 MB。'), { status: 400 });
      readMetadata(raw);
      busy = true;
      const id = randomUUID(), job = path.join(jobsRoot, id);
      try {
        await mkdir(job, { recursive: true });
        for (const name of ['config', 'layouts', 'assets', 'data', 'i18n', 'content']) {
          const source = path.join(blog, name);
          if (await stat(source).then(value => value.isDirectory()).catch(() => false)) await cp(source, path.join(job, name), { recursive: true });
        }
        const baseURL = `http://127.0.0.1:${server.address().port}/${id}/xvsf/`;
        await mkdir(path.join(job, 'config', 'workbench'), { recursive: true });
        await writeFile(path.join(job, 'config', 'workbench', 'hugo.json'), JSON.stringify({
          baseURL, enableGitInfo: false, build: { writeStats: false },
          security: { enableInlineShortcodes: false, exec: { allow: ['none'] }, http: { urls: ['none'] }, funcs: { getenv: ['^HUGO_ENVIRONMENT$'] } }
        }));
        const previewRaw = writeMetadata(raw, { url: '/workbench-preview/', aliases: [], comments: false });
        await mkdir(path.join(job, 'content', 'posts'), { recursive: true });
        await writeFile(path.join(job, 'content', 'posts', '__workbench_preview.md'), previewRaw);
        const args = ['--source', job, '--environment', 'workbench', '--themesDir', path.join(blog, 'themes'), '--destination', path.join(job, 'public'), '--cacheDir', path.join(job, 'cache'), '--noBuildLock', '--buildDrafts', '--buildFuture', '--buildExpired', '--baseURL', baseURL];
        await run(process.env.HUGO_BIN || 'hugo', args, { cwd: job, windowsHide: true, timeout: 60_000, maxBuffer: 4 * 1024 * 1024 });
        await stat(path.join(job, 'public', 'workbench-preview', 'index.html'));
        jobs.set(id, job);
        while (jobs.size > 3) { const [oldId, directory] = jobs.entries().next().value; jobs.delete(oldId); await removeJob(directory); }
        return { url: `${baseURL}workbench-preview/`, builtAt: new Date().toISOString() };
      } catch (error) {
        await removeJob(job).catch(() => {});
        const details = error.stderr || error.stdout || error.message;
        throw Object.assign(new Error(error.code === 'ENOENT' ? '未找到 Hugo，请安装 Hugo 或设置 HUGO_BIN 后重启本地服务。' : `Hugo 预览生成失败：${String(details).slice(-2200)}`), { status: 422 });
      } finally { busy = false; }
    }
  };
}
