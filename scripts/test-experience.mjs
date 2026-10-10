import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { writeMetadata, readMetadata } from '../workbench/model.mjs';
import { parseFeed, refreshFriendFeeds } from './friend-feeds.mjs';

test('public note metadata round-trips without replacing the Markdown body', () => {
  const original = '---\ntitle: A note\ndate: 2026-10-10\ncategories: [测试]\ndraft: true\n---\n\nA body with `code`.\n';
  const note = writeMetadata(original, {format:'note'});
  assert.equal(readMetadata(note).format,'note'); assert.equal(readMetadata(note).draft,true);
  assert.ok(note.endsWith('A body with `code`.\n'));
  const article = writeMetadata(note, {format:undefined});
  assert.equal(readMetadata(article).format,undefined); assert.doesNotMatch(article,/format:/);
});
const friend={name:'Fixture friend',url:'https://friend.example/',feed:'https://friend.example/atom.xml'};
const atom='<feed xmlns="http://www.w3.org/2005/Atom"><entry><title><![CDATA[<b>真实标题</b>]]></title><link href="https://friend.example/post/"/><published>2026-01-01T12:00:00Z</published></entry></feed>';
test('feed parsing supports Atom and RSS without executing content', () => {
  assert.equal(parseFeed(atom,friend)[0].title,'真实标题');
  const rss='<rss><channel><item><title>A &amp; B</title><link>https://friend.example/b/</link><pubDate>Thu, 01 Jan 2026 12:00:00 GMT</pubDate></item></channel></rss>';
  assert.equal(parseFeed(rss,friend)[0].title,'A & B');
  assert.equal(parseFeed(atom.replace('https://friend.example/post/','javascript:alert(1)'),friend).length,0);
  assert.equal(parseFeed(atom.replace('https://friend.example/post/','https://other.example/'),friend).length,0);
  assert.equal(parseFeed(atom.replace('2026-01-01','2099-01-01'),friend).length,0);
  assert.throws(()=>parseFeed('<!DOCTYPE feed [<!ENTITY x SYSTEM "file:///etc/passwd">]>'+atom,friend),/doctypes/);
  assert.throws(()=>parseFeed('<feed>'+ 'a'.repeat(2*1024*1024)+'</feed>',friend),/2 MiB/);
});
test('feed failure retains cache and inactive friends are removed', async () => {
  const root=await mkdtemp(path.join(os.tmpdir(),'xvsf-feeds-'));
  try {
    await mkdir(path.join(root,'data/friends'),{recursive:true});
    await writeFile(path.join(root,'data/friends/a.yaml'),JSON.stringify(friend));
    let snapshot=await refreshFriendFeeds({root,force:true,fetchImpl:async()=>new Response(atom),now:Date.parse('2026-02-01')});
    assert.equal(snapshot.items.length,1);
    snapshot=await refreshFriendFeeds({root,force:true,fetchImpl:async()=>{throw Error('offline');},now:Date.parse('2026-02-02')});
    assert.equal(snapshot.items.length,1); assert.equal(snapshot.sources[0].status,'cached');
    await writeFile(path.join(root,'data/friends/a.yaml'),JSON.stringify({...friend,status:'paused'}));
    snapshot=await refreshFriendFeeds({root,force:true,fetchImpl:async()=>{throw Error('must not request');}});
    assert.equal(snapshot.items.length,0); assert.equal(snapshot.sources.length,0);
  } finally { await rm(root,{recursive:true,force:true}); }
});
test('Hugo keeps duplicate-title anchors and honors code disclosure attributes', async () => {
  const root=await mkdtemp(path.join(os.tmpdir(),'xvsf-reading-'));
  const put=async(file,text)=>{await mkdir(path.dirname(path.join(root,file)),{recursive:true});await writeFile(path.join(root,file),text);};
  try {
    await put('hugo.yaml','baseURL: https://example.org/xvsf/\n');
    for(const file of ['layouts/partials/reading/content.html','layouts/_default/_markup/render-codeblock.html'])await put(file,await readFile(new URL('../'+file,import.meta.url),'utf8'));
    await put('layouts/_default/single.html','{{ partial "reading/content.html" . }}'); await put('layouts/index.html','home');
    await put('content/a.md','---\ntitle: Same title\n---\n# Same title\n\n```js {filename="agent.js"}\nconsole.log(1)\n```\n\n```js {open=false}\nclosed()\n```\n\n```diff\n-old\n+new\n```\n\n```js\n'+('line\n'.repeat(20))+'```');
    await put('content/b.md','---\ntitle: Other\n---\n# Unique heading\n');
    const run=spawnSync('hugo',['--source',root,'--quiet'],{encoding:'utf8',windowsHide:true}); assert.equal(run.status,0,run.stderr);
    const html=await readFile(path.join(root,'public/a/index.html'),'utf8');
    assert.match(html,/<span id="same-title" class="article-title-anchor"/);assert.doesNotMatch(html,/<h1/);
    assert.match(html,/id="code-0" data-expanded="true"/);assert.match(html,/agent.js/);
    assert.match(html,/id="code-1" data-expanded="false"/);assert.match(html,/id="code-3" data-expanded="false"/);
    assert.match(await readFile(path.join(root,'public/b/index.html'),'utf8'),/<h1 id="unique-heading"/);
  } finally { await rm(root,{recursive:true,force:true}); }
});
