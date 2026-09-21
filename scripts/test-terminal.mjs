import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePath, tokenize, createFilesystem, childNodes } from '../assets/js/terminal/core.mjs';

test('quoted Chinese paths, escaped spaces and root traversal', () => {
  assert.deepEqual(tokenize('cat "../安全研究/文章 一.md"'), ['cat', '../安全研究/文章 一.md']);
  assert.deepEqual(tokenize('cat a\\ b.md'), ['cat', 'a b.md']);
  assert.equal(resolvePath('../安全研究/./文章 一.md', '/posts/notes'), '/posts/安全研究/文章 一.md');
  assert.equal(resolvePath('../../../../etc', '/posts'), '/etc');
  assert.equal(resolvePath('~/posts'), '/posts');
  assert.throws(() => tokenize('cat "unfinished'), /unclosed quote/);
  assert.deepEqual(tokenize('cat "unfinished', true), ['cat', 'unfinished']);
});

test('article references share content and directories list only direct children', () => {
  const tree = createFilesystem({ version: 1, posts: [{ id: 'a', title: 'Article', canonical_url: '/posts/a/' }], tree: [
    { path: '/', type: 'dir' }, { path: '/posts', type: 'dir' }, { path: '/posts/深层', type: 'dir' },
    { path: '/posts/深层/a.md', type: 'ref', id: 'a' }, { path: '/also.md', type: 'ref', id: 'a' }
  ] });
  assert.equal(tree.get('/posts/深层/a.md').post, tree.get('/also.md').post);
  assert.deepEqual(childNodes(tree, '/posts').map(([path]) => path), ['/posts/深层']);
  assert.equal(tree.get('/also.md').post.canonical, '/posts/a/');
});

test('invalid manifests cannot introduce ambiguous paths or missing articles', () => {
  for (const nodes of [[{ path: '/bad/../path', type: 'dir' }], [{ path: '/a', type: 'ref', id: 'missing' }], [{ path: '/', type: 'dir' }, { path: '/', type: 'dir' }]]) {
    assert.throws(() => createFilesystem({ version: 1, posts: [], tree: nodes }), /manifest/);
  }
});


test('full-text search filters results to the public manifest and falls back to catalog', async () => {
  const { createSearch } = await import('../assets/js/terminal/content.mjs');
  globalThis.location = new URL('https://example.invalid/xvsf/');
  const post = { id: 'visible', title: '中文文章', description: '代码审计', categories: ['安全'], tags: ['Java'], canonical_url: 'https://example.invalid/xvsf/posts/中文/' };
  const moduleURL = 'data:text/javascript,' + encodeURIComponent('export async function search(){return {results:[{data:async()=>({url:"/xvsf/posts/%E4%B8%AD%E6%96%87/"})},{data:async()=>({url:"/xvsf/posts/hidden/"})}]}}');
  const result = await createSearch({ posts: [post] }, moduleURL)('body-only keyword');
  assert.equal(result.mode, 'full-text');
  assert.deepEqual(result.posts, [post]);
  const failureURL = 'data:text/javascript,' + encodeURIComponent('export async function search(){throw Error("offline")}');
  const fallback = await createSearch({ posts: [post] }, failureURL)('审计');
  assert.equal(fallback.mode, 'catalog');
  assert.deepEqual(fallback.posts, [post]);
  delete globalThis.location;
});


test('search paginates all public results, deduplicates, and validates page bounds', async () => {
  const { createSearch } = await import('../assets/js/terminal/content.mjs');
  globalThis.location = new URL('https://example.invalid/xvsf/');
  try {
    const posts = Array.from({ length: 65 }, (_, i) => ({ id: String(i), name: i + '.md', title: '共同 中文 ' + i, description: '', categories: [], tags: [], canonical_url: 'https://example.invalid/xvsf/posts/' + i + '/' }));
    const urls = ['/xvsf/posts/hidden/', ...posts.map(p => p.canonical_url), posts[0].canonical_url];
    const moduleURL = 'data:text/javascript,' + encodeURIComponent('export async function search(){return {results:' + JSON.stringify(urls) + '.map(url=>({data:async()=>({url})}))}}');
    const search = createSearch({ posts }, moduleURL);
    const pages = await Promise.all([1, 2, 3, 4].map(page => search('中文', page)));
    assert.deepEqual(pages.map(p => p.posts.length), [20, 20, 20, 5]);
    assert.ok(pages.every(p => p.total === 65 && p.pages === 4 && p.mode === 'full-text'));
    assert.deepEqual(pages.flatMap(p => p.posts), posts);
    await assert.rejects(search('中文', 5), /out of range/);
    await assert.rejects(search('中文', 0), /positive integer/);
    const fail = 'data:text/javascript,' + encodeURIComponent('export async function search(){throw Error("catalog")}');
    const fallback = createSearch({ posts }, fail);
    assert.equal((await fallback('共同', 4)).posts.length, 5);
    assert.deepEqual((await fallback('不存在')).posts, []);
  } finally { delete globalThis.location; }
});

test('a failed index can recover on the next query', async () => {
  const { createSearch } = await import('../assets/js/terminal/content.mjs');
  globalThis.location = new URL('https://example.invalid/');
  globalThis.terminalSearchAttempts = 0;
  try {
    const post = { id: 'a', title: 'Title', description: '', categories: [], tags: [], canonical_url: 'https://example.invalid/a/' };
    // State lives outside the imported module, just as a transient network outage does.
    const url = 'data:text/javascript,' + encodeURIComponent('export async function search(){if(!globalThis.terminalSearchAttempts++)throw Error("temporary");return {results:[{data:async()=>({url:"/a/"})}]}}\n//');
    const search = createSearch({ posts: [post] }, url);
    assert.equal((await search('body-only')).mode, 'catalog');
    assert.deepEqual((await search('body-only')).posts, [post]);
  } finally { delete globalThis.location; delete globalThis.terminalSearchAttempts; }
});

test('command results separate text from effects and reject unsupported operations', async () => {
  const { createCommands, parseSearch, descriptions } = await import('../assets/js/terminal/commands.mjs');
  const post = { id: 'a', name: '文章 一.md', title: 'Same title', canonical: 'https://example.invalid/a/' };
  const second = { ...post, id: 'b', name: '另一篇.md', canonical: 'https://example.invalid/b/' };
  const unsafe = '<img src=x onerror=alert(1)>';
  const tree = new Map([['/', { type: 'dir' }], ['/posts', { type: 'dir' }], ['/posts/文章 一.md', { type: 'post', post }], ['/literal.txt', { type: 'file', content: unsafe }], ['/home/cat', { type: 'file', content: 'cat' }], ['/bad', { type: 'link', href: 'javascript:alert(1)' }]]);
  let calls = 0;
  const commands = createCommands({ tree, posts: [post, second], manifest: { version: 1 }, manifestURL: 'https://example.invalid/manifest.json', reply: text => text, random: () => 0, search: async (query, page) => { calls++; return { mode: 'full-text', posts: [post], total: 21, page, pages: 2 }; } });
  const state = { cwd: '/posts', history: ['pwd'], info: 'Author', pet: { pose: 'idle', quiet: false, snacks: 0 }, trailCount: 0, trail: '(no pages opened)', lastPost: post };
  const run = raw => commands.execute(raw, state);
  assert.deepEqual(run('cat "文章 一.md"').effects, [{ type: 'read', post }]);
  assert.equal(run('cat /literal.txt').output[0].text, unsafe);
  assert.deepEqual(run('cd ..').effects, [{ type: 'cwd', path: '/' }]);
  assert.equal(state.cwd, '/posts');
  assert.equal(run('random').effects[0].post.id, 'b');
  assert.deepEqual(run('pet feed').effects, [{ type: 'pet', action: 'feed' }]);
  assert.equal(state.pet.snacks, 0);
  assert.equal(run('pet 你好').output[0].text, 'cat > 你好');
  assert.equal(calls, 0, 'pet never calls search or a network service');
  assert.throws(() => run('pet feed extra'), /no arguments/);
  assert.throws(() => run('open /bad'), /unsupported URL/);
  assert.throws(() => run('eval alert(1)'), /command not found/);
  assert.throws(() => run('constructor'), /command not found/);
  assert.throws(() => run('help constructor'), /unknown command/);
  assert.throws(() => run('cat "unfinished'), /syntax error/);
  assert.throws(() => run('cd /literal.txt'), /Not a directory/);
  assert.throws(() => run('cat /missing'), /No such file/);
  assert.deepEqual(parseSearch(['--page', '2', '代码审计']), { query: '代码审计', page: 2 });
  assert.throws(() => parseSearch(['--page', '-2', 'x']), /positive integer/);
  const search = await run('search "中文 topic"');
  assert.equal(search.output.at(-1).text, 'next: search --page 2 "中文 topic"');
  for (const name of Object.keys(descriptions)) {
    const raw = ({ cat: 'cat /literal.txt', open: 'open "文章 一.md"', search: 'search term' })[name] || name;
    const response = await run(raw);
    assert.ok(Array.isArray(response.output) && Array.isArray(response.effects), name);
  }
});
