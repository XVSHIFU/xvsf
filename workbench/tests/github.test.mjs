import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { buildWorkbench } from '../../scripts/build-workbench.mjs';
import { articlePath, prepareArticle, saveArticle, listArticles, RemoteConflict } from '../github.mjs';
import { newDocument, splitMarkdown, readMetadata } from '../model.mjs';
import { mockGitHub, sha } from './mock-github.mjs';

const path = 'content/posts/中文与 emoji 😀.md';
const raw = newDocument('中文与 emoji 😀', '测试').raw + '\n正文 😀\n';
const next = raw + '\n本机继续编辑\n';
const token = 'isolated-qa-mock-token';
const writes = api => api.calls.filter(call => call.method === 'PUT');

test('new Unicode post goes to a dedicated branch and PR, never protected main', async () => {
  const api = mockGitHub();
  const result = await saveArticle({ path, raw, baseSha: null }, token, api.fetch);
  assert.equal(result.pullNumber, 1); assert.equal(api.refs.get('main').has(path), false);
  assert.equal(api.refs.get(result.branch).get(path), raw);
  assert.match(result.branch, /^workbench\/post-/); assert.equal(writes(api).length, 1);
  assert.equal(Object.hasOwn(writes(api)[0].body, 'sha'), false);
});

test('editing pending article updates one PR; re-reading sees pending version; merge returns to main', async () => {
  const api = mockGitHub({ [path]: raw });
  const first = await saveArticle({ path, raw: next, baseSha: sha(raw) }, token, api.fetch);
  const second = await saveArticle({ path, raw: next + '第二次\n', baseSha: sha(next) }, token, api.fetch);
  assert.equal(first.pullNumber, second.pullNumber); assert.equal(api.pulls.length, 1);
  assert.equal(writes(api)[1].body.sha, sha(next));
  const docs = await listArticles(token, [], () => {}, api.fetch);
  assert.equal(docs.length, 1); assert.equal(docs[0].raw, second.raw); assert.equal(docs[0].github.pullNumber, 1);
  api.merge(1);
  const merged = await listArticles(token, [], () => {}, api.fetch);
  assert.equal(merged[0].github.branch, 'main'); assert.equal(merged[0].github.pullNumber, undefined);
  assert.equal(merged[0].raw, second.raw);
  const third = await saveArticle({ path, raw: second.raw + '合并后编辑\n', baseSha: second.sha }, token, api.fetch);
  assert.equal(third.pullNumber, 2); assert.notEqual(third.branch, first.branch);
});

test('lost PUT response and missing PR permission recover without duplicate content commits', async () => {
  const api = mockGitHub({ [path]: raw }); api.losePutResponse = true;
  const plan = { path, raw: next, baseSha: sha(raw) };
  await assert.rejects(saveArticle(plan, token, api.fetch), /重试/);
  api.pullFailure = 403;
  await assert.rejects(saveArticle(plan, token, api.fetch), /文章已保存.*Pull requests/);
  api.pullFailure = null;
  const result = await saveArticle(plan, token, api.fetch);
  assert.equal(result.pullNumber, 1); assert.equal(writes(api).length, 1);
  await saveArticle(plan, token, api.fetch); assert.equal(writes(api).length, 1); assert.equal(api.pulls.length, 1);
});

test('changed main, pending branch, deleted file, and create-name collision all preserve remote content', async () => {
  for (const value of [next, null]) {
    const api = mockGitHub({ [path]: raw }); api.change('main', path, value);
    await assert.rejects(saveArticle({ path, raw: raw + 'mine', baseSha: sha(raw) }, token, api.fetch), RemoteConflict);
    assert.equal(writes(api).length, 0);
  }
  const api = mockGitHub({ [path]: raw });
  await assert.rejects(saveArticle({ path, raw: next, baseSha: null }, token, api.fetch), RemoteConflict);
  const first = await saveArticle({ path, raw: next, baseSha: sha(raw) }, token, api.fetch);
  api.change(first.branch, path, next + 'other device');
  await assert.rejects(saveArticle({ path, raw: next + 'mine', baseSha: first.sha }, token, api.fetch), error => error instanceof RemoteConflict && error.remote.branch === first.branch && error.remote.pullNumber === 1);
  assert.equal(writes(api).length, 1);
});

test('compare-and-swap rejects a remote edit racing the write, with no forced retry', async () => {
  const api = mockGitHub({ [path]: raw });
  api.beforePut = (branch, path) => api.change(branch, path, 'RACING REMOTE CONTENT');
  await assert.rejects(saveArticle({ path, raw: next, baseSha: sha(raw) }, token, api.fetch), RemoteConflict);
  assert.equal(writes(api).length, 1); assert.equal(api.pulls.length, 0);
});

test('permission failure does not create a PR or claim that a write succeeded', async () => {
  const api = mockGitHub({ [path]: raw }); api.putFailure = 403;
  await assert.rejects(saveArticle({ path, raw: next, baseSha: sha(raw) }, token, api.fetch), /Contents 和 Pull requests/);
  assert.equal(api.pulls.length, 0); assert.equal(api.refs.get('main').get(path), raw);
});

test('path boundary and content limit fail before any network write', async () => {
  const api = mockGitHub();
  for (const path of ['.github/workflows/pages.yml', 'content/posts/../README.md', 'content/posts/_index.md', 'content/posts/nested/file.md']) await assert.rejects(saveArticle({ path, raw, baseSha: null }, token, api.fetch));
  assert.throws(() => articlePath('../unsafe.md'));
  await assert.rejects(saveArticle({ path, raw: 'x'.repeat(2 * 1024 * 1024 + 1) }, token, api.fetch));
  assert.equal(api.calls.length, 0);
});

test('metadata preparation preserves body and blocks missing publication description', () => {
  assert.equal(splitMarkdown(prepareArticle(raw)).body, splitMarkdown(raw).body);
  assert.equal(readMetadata(prepareArticle(raw)).draft, true);
  assert.throws(() => prepareArticle(raw.replace('draft: true', 'draft: false')), /摘要/);
  assert.throws(() => prepareArticle('# no frontmatter'), /文章属性/);
});

test('incomplete tree and API authorization failure fail the whole read', async () => {
  const api = mockGitHub({ [path]: raw });
  const truncated = (url, init) => url.includes('/git/trees/') ? Promise.resolve(new Response('{"truncated":true,"tree":[]}', { status: 200 })) : api.fetch(url, init);
  await assert.rejects(listArticles(token, [], () => {}, truncated), /完整结果/);
  await assert.rejects(listArticles(token, [], () => {}, () => Promise.resolve(new Response('{}', { status: 401 }))), /令牌无效/);
});

test('Windows checkout copies are refreshed from GitHub even when their Git index SHA matches', async () => {
  const api = mockGitHub({ [path]: raw });
  const cached = [{ github: { repository: 'XVSHIFU/xvsf', branch: 'main', path, sha: sha(raw), baseRaw: raw.replaceAll('\n', '\r\n') } }];
  const docs = await listArticles(token, cached, () => {}, api.fetch);
  assert.equal(docs[0].raw, raw);
  const result = await saveArticle({ path, raw: next, baseSha: docs[0].github.sha }, token, api.fetch);
  assert.equal(result.pullNumber, 1); assert.equal(api.refs.get('main').get(path), raw);
});

test('public Pages build includes runtime and pinned dependencies, without article copies or server files', async () => {
  const target = 'tmp/workbench-test/admin'; await buildWorkbench(target);
  const index = JSON.parse(await readFile(`${target}/data/index.json`, 'utf8'));
  assert.equal(index.localPreview, false); assert.deepEqual(index.documents, []);
  assert.deepEqual(await readdir(`${target}/data/documents`), []);
  for (const file of ['app.mjs', 'github.mjs', 'github-ui.mjs', 'vendor/vditor/dist/index.min.js', 'vendor/yaml/browser/index.js', 'vendor/vditor/LICENSE', 'vendor/yaml/LICENSE']) assert.ok((await stat(`${target}/${file}`)).isFile());
  for (const file of ['server.mjs', 'preview-server.mjs', 'tests', '.qa', 'README.md']) await assert.rejects(stat(`${target}/${file}`), { code: 'ENOENT' });
  await assert.rejects(buildWorkbench('content/posts'), /Unsafe/);
});
