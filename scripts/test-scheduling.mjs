import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const hugo = process.env.HUGO_BIN || 'hugo';
const fixture = await mkdtemp(path.join(os.tmpdir(), 'xvsf-schedule-'));

async function put(relative, content) {
  const target = path.join(fixture, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content);
}

await put('hugo.yaml', 'baseURL: "https://example.invalid/"\ntimeZone: "Asia/Shanghai"\n');
await put('layouts/_default/single.html', '{{ .Title }}');
await put('content/posts/scheduled.md', `---
title: Scheduled
date: 2026-07-23T10:00:00+08:00
draft: false
publishDate: 2026-07-23T12:00:00+08:00
expiryDate: 2026-07-23T14:00:00+08:00
---
scheduled body
`);
await put('content/posts/draft.md', `---
title: Draft
date: 2026-07-23T10:00:00+08:00
draft: true
---
draft body
`);

function build(name, clock, flags = []) {
  const destination = path.join(fixture, name);
  const result = spawnSync(hugo, ['--source', fixture, '--destination', destination, '--clock', clock, '--cleanDestinationDir', ...flags], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${name} build failed:\n${result.stdout}\n${result.stderr}`);
  return destination;
}

async function assertFile(destination, relative, expected) {
  let found = true;
  try { await readFile(path.join(destination, relative)); } catch { found = false; }
  if (found !== expected) throw new Error(`${relative}: expected ${expected ? 'present' : 'absent'} in ${destination}`);
}

try {
  const before = build('before', '2026-07-23T11:59:00+08:00');
  await assertFile(before, 'posts/scheduled/index.html', false);
  await assertFile(before, 'posts/draft/index.html', false);

  const active = build('active', '2026-07-23T13:00:00+08:00');
  await assertFile(active, 'posts/scheduled/index.html', true);
  await assertFile(active, 'posts/draft/index.html', false);

  const expired = build('expired', '2026-07-23T14:01:00+08:00');
  await assertFile(expired, 'posts/scheduled/index.html', false);

  const preview = build('preview', '2026-07-23T11:00:00+08:00', ['--buildDrafts', '--buildFuture', '--buildExpired']);
  await assertFile(preview, 'posts/scheduled/index.html', true);
  await assertFile(preview, 'posts/draft/index.html', true);
  console.log('Scheduling behavior verified: future, active, expired, draft, and preview cases passed.');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
