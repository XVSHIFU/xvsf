import { readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read the same anonymous pages a visitor sees; no token, private repositories or API quota.
const profileURL = 'https://github.com/XVSHIFU';
const calendarURL = 'https://github.com/users/XVSHIFU/contributions';
const attr = (tag, name) => tag.match(new RegExp('(?:^|\\s)' + name + '="([^"]*)"'))?.[1];
const plain = html => html.replace(/<[^>]*>/g, '').replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, entity) => {
  if (entity[0] === '#') { const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)); return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''; }
  return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[entity.toLowerCase()];
}).replace(/\s+/g, ' ').trim();

export function parsePinned(html) {
  if (!html.includes('js-pinned-items-reorder-container')) throw new Error('Unrecognized GitHub profile');
  const cards = [...html.matchAll(/<li\b[^>]*class="[^"]*js-pinned-item-list-item[^>]*>[\s\S]*?<\/li>/g)].map(match => match[0]);
  const pinned = [];
  for (const card of cards) {
    if (!card.includes('PINNED_REPO')) continue; // GitHub may substitute popular repositories when nothing is pinned.
    const anchor = card.match(/<a\b[^>]*href="(\/[\w.-]+\/[\w.-]+)"[^>]*>\s*<span class="repo">([\s\S]*?)<\/span>/);
    if (!anchor || !/class="[^"]*\bpublic\b/.test(card)) throw new Error('Unrecognized public pinned repository');
    const description = plain(card.match(/<p class="pinned-item-desc[^>]*>([\s\S]*?)<\/p>/)?.[1] || '');
    const language = plain(card.match(/itemprop="programmingLanguage">([\s\S]*?)<\/span>/)?.[1] || '');
    const color = card.match(/class="repo-language-color" style="background-color: (#[0-9a-f]{6})"/i)?.[1] || '#888888';
    const count = suffix => { const link = [...card.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].find(match => match[1] === anchor[1] + suffix); return link ? plain(link[2]) : '0'; };
    pinned.push({ name: plain(anchor[2]), repo: profileURL.replace('/XVSHIFU', '') + anchor[1], description, language, color, stars: count('/stargazers'), forks: count('/forks') });
  }
  if (html.includes('PINNED_REPO') && !pinned.length) throw new Error('Pinned repository markup changed');
  return pinned.slice(0, 6);
}

export function parseCalendar(html) {
  const totalMatch = html.match(/([\d,]+)\s+contributions\s+in the last year/);
  if (!totalMatch) throw new Error('Unrecognized contribution calendar');
  const tips = new Map([...html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)].map(match => [attr(match[1], 'for'), plain(match[2])]));
  const days = [...html.matchAll(/<td\b[^>]*data-date="[^>]+>/g)].map(match => {
    const date = attr(match[0], 'data-date');
    const level = Number(attr(match[0], 'data-level'));
    const label = tips.get(attr(match[0], 'id')) || '';
    const countMatch = label.match(/^(No|[\d,]+) contributions? on /);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(level) || level < 0 || level > 4 || !countMatch) throw new Error('Invalid contribution day');
    return { date, level, count: countMatch[1] === 'No' ? 0 : Number(countMatch[1].replaceAll(',', '')) };
  }).sort((a, b) => a.date.localeCompare(b.date));
  if (days.length < 365 || days.length > 371) throw new Error('Incomplete contribution calendar');
  const first = Date.parse(days[0].date);
  for (let index = 0; index < days.length; index++) if (Date.parse(days[index].date) !== first + index * 86400000) throw new Error('Non-contiguous contribution dates');
  const total = Number(totalMatch[1].replaceAll(',', ''));
  if (days.reduce((sum, day) => sum + day.count, 0) !== total) throw new Error('Contribution total mismatch');
  return { total, days };
}

// Refresh at build time, at most once a day per local cache. A broken upstream never erases valid data.
export async function refreshProjectActivity({ root = process.cwd(), fetchImpl = fetch, now = Date.now(), offline = process.env.PROJECT_ACTIVITY_OFFLINE === '1', force = false } = {}) {
  const readJSON = async name => { try { return JSON.parse(await readFile(path.join(root, 'data', name), 'utf8')); } catch { return null; } };
  const cached = await readJSON('github_activity_live.json') || await readJSON('github_activity.json');
  if (offline || (!force && cached?.fetched_at && now - Date.parse(cached.fetched_at) < 86400000)) return cached;
  try {
    const pages = await Promise.all([profileURL, calendarURL].map(async url => {
      const response = await fetchImpl(url, { headers: { Accept: 'text/html', 'Accept-Language': 'en-US', 'User-Agent': 'xvsf-blog-build' }, signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
      return response.text();
    }));
    const snapshot = { fetched_at: new Date(now).toISOString(), source: profileURL, pinned: parsePinned(pages[0]), calendar: parseCalendar(pages[1]) };
    const target = path.join(root, 'data/github_activity_live.json');
    await writeFile(target + '.tmp', JSON.stringify(snapshot, null, 2) + '\n');
    await rename(target + '.tmp', target);
    return snapshot;
  } catch (error) {
    console.warn('GitHub profile: keeping cached snapshot (' + error.message + ')');
    return cached;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await refreshProjectActivity({ force: process.argv.includes('--force') });
