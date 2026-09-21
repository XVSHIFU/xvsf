import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { cleanTerminalOutputs } from './build-site.mjs';
const fixture = await mkdtemp(path.join(os.tmpdir(), 'xvsf-terminal-'));
const hugo = process.env.HUGO_BIN || 'hugo';
async function put(relative, text) { const target = path.join(fixture, relative); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, text); }
const output = path.join(fixture, 'public');
const base = 'https://example.invalid/xvsf/';
await put('hugo.yaml', 'baseURL: "' + base + '"\ntimeZone: "Asia/Shanghai"\nparams:\n  terminal:\n    enabled: true\n  authorProfile:\n    bio: Test\n  about:\n    intro: Test\n');
for (const name of ['build', 'headings']) await put('layouts/partials/terminal/' + name + '.html', await readFile(new URL('../layouts/partials/terminal/' + name + '.html', import.meta.url), 'utf8'));
await put('layouts/partials/friends/data.html', await readFile(new URL('../layouts/partials/friends/data.html', import.meta.url), 'utf8'));
await put('data/friends/active.yaml', 'name: 中文/朋友\nurl: https://friend.example/\nstatus: active\n');
await put('data/friends/paused.yaml', 'name: Paused\nurl: https://paused.example/\nstatus: paused\n');
await put('data/friends/hidden.yaml', 'name: Hidden\nurl: https://hidden.example/\nenabled: false\n');
await put('layouts/partials/terminal/reader-document.html', '<!doctype html><html lang="en"><head><title>{{ .Title }}</title><meta name="robots" content="noindex"></head><body data-pagefind-ignore="all">{{ .Content }}</body></html>');
await put('layouts/index.html', '{{ if ne site.Params.terminal.enabled false }}{{ $x := partial "terminal/build.html" . }}{{ $x.manifest }}{{ end }}');
await put('layouts/_default/single.html', '{{ .Content }}');
await put('layouts/_default/list.html', '{{ .Title }}');
const doc = (title, extra = '', body = '# First\n## Second\n###### Deep\nVisible body') => '---\ntitle: ' + title + '\ndate: 2026-07-23T10:00:00+08:00\n' + extra + '\n---\n' + body + '\n';
await put('content/posts/目录/文章 一.md', doc('Visible', 'categories: [安全]\ntags: [Java]'));
await put('content/posts/hidden.md', doc('Hidden', 'searchHidden: true'));
await put('content/posts/draft.md', doc('Draft', 'draft: true'));
await put('content/posts/scheduled.md', doc('Scheduled', 'publishDate: 2026-07-23T12:00:00+08:00\nexpiryDate: 2026-07-23T14:00:00+08:00'));
async function build(clock, flags = []) {
  await cleanTerminalOutputs(output, fixture);
  const run = spawnSync(hugo, ['--source', fixture, '--destination', output, '--cleanDestinationDir', '--clock', clock, ...flags], { encoding: 'utf8', windowsHide: true });
  assert.equal(run.status, 0, run.stdout + run.stderr);
  try { return JSON.parse(await readFile(path.join(output, '.well-known/xvsf-manifest.json'), 'utf8')); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function absent(relative) { await assert.rejects(readFile(path.join(output, relative)), { code: 'ENOENT' }); }
try {
  const before = await build('2026-07-23T11:00:00+08:00');
  assert.deepEqual(before.posts.map(p => p.title), ['Visible']);
  for (const dir of before.tree.filter(n => n.type === 'dir')) {
    const expected = before.tree.filter(n => n.path !== '/' && path.posix.dirname(n.path) === dir.path).map(n => n.path).sort();
    assert.deepEqual([...dir.children].sort(), expected, dir.path + ' direct children');
  }
  const friendLinks = before.tree.filter(n => n.type === 'link' && n.path.startsWith('/links/'));
  assert.equal(friendLinks.length, 1, 'Only active public friends enter the terminal');
  assert.equal(friendLinks[0].href, 'https://friend.example/');
  assert.ok(friendLinks[0].path.includes('中文%2F朋友-'), 'Friend names cannot create unlisted subdirectories');
  const visible = before.posts[0];
  assert.equal(visible.name, '目录/文章 一.md');
  assert.equal(visible.path, '/posts/目录/文章 一.md');
  assert.ok(visible.endpoint.startsWith('/xvsf/terminal/content/'));
  const content = JSON.parse(await readFile(path.join(output, visible.endpoint.slice('/xvsf/'.length)), 'utf8'));
  assert.deepEqual(content.headings.map(h => h.level), [1, 2, 6]);
  assert.ok(before.tree.some(n => n.path === '/categories/安全/目录/文章 一.md' && n.id === visible.id));
  const active = await build('2026-07-23T13:00:00+08:00');
  assert.ok(active.posts.some(p => p.title === 'Scheduled'));
  const scheduled = active.posts.find(p => p.title === 'Scheduled');
  const expired = await build('2026-07-23T14:01:00+08:00');
  assert.deepEqual(expired.posts.map(p => p.title), ['Visible']);
  await absent(scheduled.endpoint.slice('/xvsf/'.length));
  await absent(scheduled.reader_url.slice('/xvsf/'.length));
  const preview = await build('2026-07-23T11:00:00+08:00', ['--buildDrafts', '--buildFuture', '--buildExpired', '--baseURL', 'https://preview.invalid/']);
  assert.deepEqual(preview.posts.map(p => p.title).sort(), ['Draft', 'Scheduled', 'Visible']);
  assert.ok(preview.posts.every(p => p.endpoint.startsWith('/terminal/') && p.canonical_url.startsWith('https://preview.invalid/')));
  await put('content/posts/目录/文章 一.md', doc('Renamed', 'categories: [安全]\ntags: [Java]', 'Changed body'));
  const renamed = (await build('2026-07-23T11:00:00+08:00')).posts[0];
  assert.equal(renamed.id, visible.id);
  assert.notEqual(renamed.content_hash, visible.content_hash);
  await rm(path.join(fixture, 'content/posts/目录/文章 一.md'));
  await build('2026-07-23T11:00:00+08:00');
  await absent(visible.endpoint.slice('/xvsf/'.length));
  await put('disabled.yaml', 'params:\n  terminal:\n    enabled: false\n');
  assert.equal(await build('2026-07-23T13:00:00+08:00', ['--config', 'hugo.yaml,disabled.yaml']), null);
  console.log('Terminal build: publication, preview, paths, headings, stable IDs, hashes, cleanup and disabled mode passed.');
} finally {
  // Delete only the specific mkdtemp directory under the OS temporary root.
  const parent = path.resolve(os.tmpdir()) + path.sep;
  if (!path.resolve(fixture).startsWith(parent) || !path.basename(fixture).startsWith('xvsf-terminal-')) throw Error('Unsafe fixture cleanup');
  await rm(fixture, { recursive: true, force: true });
}
