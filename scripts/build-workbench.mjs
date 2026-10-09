import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readMetadata } from '../workbench/model.mjs';

export const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const browserFiles = ['index.html', 'style.css', 'app.mjs', 'model.mjs', 'store.mjs', 'image-bed.mjs', 'image-ui.mjs', 'workspace-model.mjs', 'workspace-ui.mjs', 'github.mjs', 'github-ui.mjs'];
export const articleRepository = { repository: 'XVSHIFU/xvsf', branch: 'main', folder: 'content/posts' };

// Only this generated namespace is replaced. Never copy server code, QA files,
// local storage, credentials, or unpublished Markdown into a Pages artifact.
export async function buildWorkbench(destination, { local = false } = {}) {
  const target = path.resolve(destination);
  if (!target.startsWith(workspaceRoot + path.sep) || !['admin', 'workbench-public'].includes(path.basename(target))) throw new Error('Unsafe workbench build destination');
  await rm(target, { recursive: true, force: true });
  await mkdir(path.join(target, 'data', 'documents'), { recursive: true });
  for (const name of browserFiles) await cp(path.join(workspaceRoot, 'workbench', name), path.join(target, name));
  for (const [dependency, directory] of [['vditor', 'dist'], ['yaml', 'browser']]) {
    const from = path.join(workspaceRoot, 'node_modules', dependency), to = path.join(target, 'vendor', dependency);
    await mkdir(to, { recursive: true });
    await cp(path.join(from, directory), path.join(to, directory), { recursive: true });
    await cp(path.join(from, 'LICENSE'), path.join(to, 'LICENSE'));
    if (dependency === 'yaml') await writeFile(path.join(to, 'package.json'), '{"type":"module"}\n');
  }
  const documents = [];
  if (local) {
    // Git's index keeps repository blob IDs even when Windows checks files out
    // with CRLF. Using the working-copy hash would report false remote conflicts.
    const tracked = new Map(execFileSync('git', ['ls-files', '--stage', '-z', '--', 'content/posts'], { cwd: workspaceRoot, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean).map(entry => { const [details, filename] = entry.split('\t'); return [filename, details.split(' ')[1]]; }));
    for (const name of await readdir(path.join(workspaceRoot, 'content', 'posts'))) {
      if (!/\.md$/i.test(name) || /^_?index\.md$/i.test(name)) continue;
      const buffer = await readFile(path.join(workspaceRoot, 'content', 'posts', name));
      const raw = buffer.toString('utf8'), meta = readMetadata(raw);
      const id = createHash('sha256').update(name).digest('hex').slice(0, 20);
      const asset = `data/documents/${id}.md`;
      await writeFile(path.join(target, asset), buffer);
      const sha = tracked.get(`content/posts/${name}`) || null;
      documents.push({ id, filename: name, sourceFilename: name, title: String(meta.title || name.slice(0, -3)), categories: meta.categories || [], tags: meta.tags || [], date: String(meta.date || ''), draft: meta.draft === true, asset,
        github: { ...articleRepository, path: `content/posts/${name}`, sha, baseRaw: raw } });
    }
  }
  await writeFile(path.join(target, 'data', 'index.json'), JSON.stringify({ localPreview: local, ...articleRepository, documents }));
  return { destination: target, articles: documents.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const destination = process.argv[2] || 'tmp/workbench-public';
  const result = await buildWorkbench(destination, { local: process.argv.includes('--local') });
  console.log(`Built writing workspace: ${path.relative(workspaceRoot, result.destination)} (${result.articles} local articles)`);
}
