import { SaxesParser } from 'saxes';
import YAML from 'yaml';
import { readFile, readdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT = 2 * 1024 * 1024;
const clean = value => String(value || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);
export function parseFeed(xml, friend, now = Date.now()) {
  if (Buffer.byteLength(xml) > LIMIT) throw Error('Feed exceeds 2 MiB');
  const parser = new SaxesParser({ xmlns: true }); const items = []; const stack = []; let entry, root;
  parser.on('doctype', () => { throw Error('Feed doctypes are not supported'); });
  parser.on('opentag', tag => {
    const name = tag.local; root ||= name; stack.push(name);
    if (name === 'entry' || name === 'item') entry = {};
    if (entry && name === 'link') { const attrs = Object.fromEntries(Object.values(tag.attributes).map(a => [a.local, a.value])); if (attrs.href && (!attrs.rel || attrs.rel === 'alternate')) entry.link = attrs.href; }
  });
  const text = value => { const field = stack.at(-1); if (entry && ['title', 'link', 'pubDate', 'published', 'updated', 'date'].includes(field)) entry[field] = (entry[field] || '') + value; };
  parser.on('text', text); parser.on('cdata', text);
  parser.on('closetag', tag => {
    if (entry && (tag.local === 'item' || tag.local === 'entry')) {
      try {
        if (!entry.link?.trim()) throw Error('Missing article URL');
        const url = new URL(entry.link?.trim(), friend.url); const date = Date.parse(entry.published || entry.pubDate || entry.date || entry.updated);
        // Keep the original title/date and only the friend's own public articles.
        if (url.protocol === 'https:' && url.origin === new URL(friend.url).origin && !url.username && !url.password && Number.isFinite(date) && date <= now && clean(entry.title)) items.push({ site: friend.name, site_url: friend.url, url: url.href, title: clean(entry.title), date: new Date(date).toISOString() });
      } catch { /* Invalid items cannot replace a good cache. */ }
      entry = undefined;
    }
    stack.pop();
  });
  parser.write(xml).close(); if (!['rss', 'feed', 'RDF'].includes(root)) throw Error('Not an RSS or Atom feed');
  return [...new Map(items.map(item => [item.url, item])).values()].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8);
}
async function fetchFeed(url, fetchImpl) {
  const response = await fetchImpl(url, { redirect: 'error', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml', 'User-Agent': 'xvsf-friend-feed/1.0' } });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  if (Number(response.headers.get('content-length')) > LIMIT) throw Error('Feed too large');
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > LIMIT) throw Error('Feed too large'); chunks.push(value); } }
  finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks).toString('utf8');
}
export async function refreshFriendFeeds({ root = process.cwd(), fetchImpl = fetch, now = Date.now(), force = false, offline = process.env.FRIEND_FEEDS_OFFLINE === '1' } = {}) {
  const read = async name => { try { return JSON.parse(await readFile(path.join(root, 'data', name), 'utf8')); } catch { return null; } };
  const previous = await read('friend_feed_live.json') || await read('friend_feed.json') || { items: [], sources: [] };
  const friends = [];
  for (const file of await readdir(path.join(root, 'data/friends'))) {
    if (!file.endsWith('.yaml')) continue; const friend = YAML.parse(await readFile(path.join(root, 'data/friends', file), 'utf8'));
    if (friend.enabled === false || (friend.status && friend.status !== 'active') || !friend.feed) continue;
    const url = new URL(friend.feed); if (url.protocol !== 'https:' || url.origin !== new URL(friend.url).origin || url.username || url.password) throw Error(`Feed must use the friend's HTTPS origin: ${file}`);
    friends.push(friend);
  }
  const allowed = new Set(friends.map(f => f.url));
  const cachedItems = (previous.items || []).filter(item => allowed.has(item.site_url));
  const persist = async snapshot => {
    const target = path.join(root, 'data/friend_feed_live.json');
    await writeFile(target + '.tmp', JSON.stringify(snapshot, null, 2) + '\n');
    await rename(target + '.tmp', target); return snapshot;
  };
  if (offline) return persist({ ...previous, items: cachedItems, sources: (previous.sources || []).filter(source => friends.some(friend => friend.feed === source.url)) });
  const sources = [], items = [];
  await Promise.all(friends.map(async friend => {
    const cached = (previous.sources || []).find(source => source.url === friend.feed);
    const oldItems = cachedItems.filter(item => item.site_url === friend.url);
    if (!force && cached?.fetched_at && now - Date.parse(cached.fetched_at) < 86400000) { sources.push(cached); items.push(...oldItems); return; }
    try { const entries = parseFeed(await fetchFeed(friend.feed, fetchImpl), friend, now); items.push(...entries); sources.push({ url: friend.feed, site: friend.name, fetched_at: new Date(now).toISOString(), status: 'ok' }); }
    catch (error) { items.push(...oldItems); sources.push({ url: friend.feed, site: friend.name, fetched_at: cached?.fetched_at || null, status: 'cached' }); console.warn(`Friend feed: ${friend.name}: ${error.message}; retaining previous items`); }
  }));
  const snapshot = { version: 1, generated_at: new Date(now).toISOString(), sources: sources.sort((a,b) => a.url.localeCompare(b.url)), items: [...new Map(items.map(item => [item.url, item])).values()].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 36) };
  return persist(snapshot);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await refreshFriendFeeds({ force: process.argv.includes('--force') });
