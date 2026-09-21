import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parsePinned, parseCalendar, refreshProjectActivity } from './project-activity.mjs';

const profile = '<div class="js-pinned-items-reorder-container"><li class="js-pinned-item-list-item"><div class="Box public source"><a data-target="PINNED_REPO" href="/XVSHIFU/xvsf"><span class="repo">xvsf</span></a><p class="pinned-item-desc">A &amp; B &lt;notes&gt;</p><span itemprop="programmingLanguage">HTML</span><span class="repo-language-color" style="background-color: #e34c26"></span><a href="/XVSHIFU/xvsf/stargazers"><svg><path></path></svg>5</a></div></li></div>';
const calendar = '<h2>2 contributions in the last year</h2>' + Array.from({ length: 365 }, (_, i) => {
  const date = new Date(Date.UTC(2025, 8, 21) + i * 86400000).toISOString().slice(0, 10);
  return '<td data-date="' + date + '" data-level="' + (i ? 0 : 1) + '" id="day-' + i + '"></td><tool-tip for="day-' + i + '">' + (i ? 'No contributions' : '2 contributions') + ' on September 21st.</tool-tip>';
}).join('');

test('pinned order, public-only cards, escaped descriptions and metadata come from the public profile', () => {
  assert.deepEqual(parsePinned(profile), [{ name: 'xvsf', repo: 'https://github.com/XVSHIFU/xvsf', description: 'A & B <notes>', language: 'HTML', color: '#e34c26', stars: '5', forks: '0' }]);
  assert.deepEqual(parsePinned(profile.replace('PINNED_REPO', 'POPULAR_REPO')), []);
  assert.throws(() => parsePinned(profile.replace('Box public source', 'Box private source')));
  assert.throws(() => parsePinned('<html>Sign in</html>'));
  assert.throws(() => parsePinned(profile.replace('js-pinned-item-list-item', 'changed-markup')));
});

test('calendar preserves daily counts and rejects missing dates, incorrect totals and broken tooltip markup', () => {
  assert.equal(parseCalendar(calendar).days.length, 365);
  assert.equal(parseCalendar(calendar).total, 2);
  assert.equal(parseCalendar(calendar).days[0].count, 2);
  for (const broken of [calendar.replace('2 contributions in', '3 contributions in'), calendar.replace('2025-09-22', '2025-09-21'), calendar.replace('for="day-0"', 'for="missing"'), calendar.replace(/<td[^>]*>/, '')]) assert.throws(() => parseCalendar(broken));
});

async function fixture() {
  await mkdir('tmp', { recursive: true });
  const root = await mkdtemp(path.resolve('tmp/github-test-'));
  await mkdir(path.join(root, 'data'));
  const snapshot = { fetched_at: '2026-09-20T00:00:00Z', pinned: parsePinned(profile), calendar: parseCalendar(calendar) };
  await writeFile(path.join(root, 'data/github_activity.json'), JSON.stringify(snapshot));
  return { root, snapshot };
}

test('offline and fresh caches make no requests', async () => {
  const { root, snapshot } = await fixture();
  const fetchImpl = () => { throw new Error('unexpected request'); };
  assert.deepEqual(await refreshProjectActivity({ root, offline: true, fetchImpl }), snapshot);
  assert.deepEqual(await refreshProjectActivity({ root, now: Date.parse('2026-09-20T06:00:00Z'), fetchImpl }), snapshot);
});

test('refresh makes two anonymous bounded requests and saves only normalized data', async () => {
  const { root } = await fixture(); let calls = 0;
  const result = await refreshProjectActivity({ root, force: true, fetchImpl: async (url, options) => {
    calls++; assert.equal(new URL(url).hostname, 'github.com'); assert.equal(options.headers.Authorization, undefined); assert.ok(options.signal);
    return { ok: true, text: async () => url.endsWith('/contributions') ? calendar : profile };
  } });
  assert.equal(calls, 2);
  assert.deepEqual(JSON.parse(await readFile(path.join(root, 'data/github_activity_live.json'), 'utf8')), result);
  assert.equal(JSON.stringify(result).includes('data-target'), false);
});

test('rate limits, offline, malformed and partial data never replace the last good snapshot', async () => {
  const { root, snapshot } = await fixture();
  for (const fetchImpl of [async () => ({ ok: false, status: 429 }), async () => { throw new Error('offline'); }, async () => ({ ok: true, text: async () => 'unexpected html' }), async url => ({ ok: true, text: async () => url.endsWith('/contributions') ? '' : profile })]) assert.deepEqual(await refreshProjectActivity({ root, force: true, fetchImpl }), snapshot);
});
