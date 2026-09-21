import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

const destination = path.resolve(process.argv[2] || '.ci-site/xvsf');
const disabled = process.argv.includes('--disabled');
const home = await readFile(path.join(destination, 'index.html'), 'utf8');
const manifestFile = path.join(destination, '.well-known/xvsf-manifest.json');
if (disabled) {
  assert.ok(!/id=["']?terminal-entry(?:["'\s>])/.test(home), 'disabled entry');
  assert.ok(!home.includes('loader.min.'), 'disabled loader');
  await assert.rejects(access(manifestFile), { code: 'ENOENT' });
  await assert.rejects(access(path.join(destination, 'terminal')), { code: 'ENOENT' });
  const styleURL = home.match(/href=["']?([^"'\s>]*stylesheet[^"'\s>]*\.css)/)?.[1];
  assert.ok(styleURL, 'site stylesheet');
  // The generated resource is always under assets/css, independent of baseURL.
  const index = styleURL.indexOf('assets/css/');
  assert.ok(index >= 0);
  const css = await readFile(path.join(destination, styleURL.slice(index)), 'utf8');
  assert.ok(!css.includes('.terminal-entry'), 'disabled entry stylesheet');
  console.log('Terminal disabled: no entry, loader, stylesheet or exports.');
} else {
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  const base = new URL(manifest.site);
  const nodes = new Map(manifest.tree.map(node => [node.path, node]));
  const posts = new Map(manifest.posts.map(post => [post.id, post]));
  assert.equal(nodes.size, manifest.tree.length, 'unique virtual paths');
  assert.equal(posts.size, manifest.posts.length, 'unique article IDs');
  const localFile = url => {
    const target = new URL(url, base);
    assert.equal(target.origin, base.origin);
    assert.ok(target.pathname.startsWith(base.pathname), 'endpoint base path');
    const file = path.resolve(destination, decodeURIComponent(target.pathname.slice(base.pathname.length)));
    assert.ok(file.startsWith(destination + path.sep), 'endpoint containment');
    return file;
  };
  for (const node of manifest.tree) {
    if (node.type === 'ref') assert.ok(posts.has(node.id), 'valid reference');
    if (node.type === 'dir') {
      const expected = manifest.tree.filter(n => n.path !== '/' && path.posix.dirname(n.path) === node.path).map(n => n.path).sort();
      assert.deepEqual([...node.children].sort(), expected, node.path);
    }
  }
  for (const post of manifest.posts) {
    const content = JSON.parse(await readFile(localFile(post.endpoint), 'utf8'));
    assert.equal(content.id, post.id);
    assert.equal(content.content_hash, post.content_hash);
    assert.equal(content.canonical_url, post.canonical_url);
    assert.deepEqual(content.categories, post.categories);
    assert.ok(content.headings.every(h => h.level >= 1 && h.level <= 6));
    const reader = await readFile(localFile(post.reader_url), 'utf8');
    assert.ok(reader.includes('noindex') && reader.includes('data-pagefind-ignore'), 'isolated reader');
    assert.ok(!reader.includes('id=terminal-entry'), 'reader has no nested terminal');
    await access(path.join(localFile(post.canonical_url), 'index.html'));
  }
  console.log('Terminal exports: ' + posts.size + ' articles, ' + nodes.size + ' nodes and all content/reader/canonical paths valid.');
}
