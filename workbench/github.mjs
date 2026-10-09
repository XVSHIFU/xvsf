import { readMetadata, writeMetadata, updatedDocument, splitMarkdown } from './model.mjs';
import { validFilename, MAX_DOCUMENT_BYTES } from './workspace-model.mjs';

export const articleRepository = Object.freeze({ repository: 'XVSHIFU/xvsf', branch: 'main', folder: 'content/posts' });
const API = `https://api.github.com/repos/${articleRepository.repository}`;
const encodePath = value => value.split('/').map(encodeURIComponent).join('/');
const encoder = new TextEncoder();
const hex = buffer => [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, '0')).join('');

export class RemoteConflict extends Error {
  constructor(remote) { super(remote ? 'GitHub 上的文章已有更新，本机修改已保留。' : 'GitHub 上的文章已被删除，本机修改已保留。'); this.name = 'RemoteConflict'; this.remote = remote; }
}
export function articlePath(filename) {
  const name = validFilename(filename);
  if (/^_?index\.md$/i.test(name)) throw new Error('index.md 和 _index.md 是目录入口，请换一个文章文件名。');
  return `${articleRepository.folder}/${name}`;
}
function checkedPath(value) {
  if (!value?.startsWith(`${articleRepository.folder}/`) || articlePath(value.slice(articleRepository.folder.length + 1)) !== value) throw new Error('只能同步 content/posts 中的文章 Markdown。');
  return value;
}
export async function articleId(path) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(checkedPath(path).slice(articleRepository.folder.length + 1)))).slice(0, 20);
}
export async function blobSha(raw) {
  const bytes = encoder.encode(raw), header = encoder.encode(`blob ${bytes.length}\0`);
  const blob = new Uint8Array(header.length + bytes.length); blob.set(header); blob.set(bytes, header.length);
  return hex(await crypto.subtle.digest('SHA-1', blob));
}
function toBase64(raw) {
  const bytes = encoder.encode(raw); let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return btoa(binary);
}
function fromBase64(content) {
  const bytes = Uint8Array.from(atob(content.replace(/\s/g, '')), value => value.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
}
function apiError(response) {
  let message;
  if (response.status === 401) message = '文章令牌无效或已过期，请在 GitHub 设置中重新填写。';
  else if (response.status === 429 || response.headers?.get('x-ratelimit-remaining') === '0' || response.headers?.has('retry-after')) message = 'GitHub 请求次数暂时受限，请稍后重试。';
  else if (response.status === 403) message = 'GitHub 拒绝了请求，请检查 xvsf 仓库的 Contents 和 Pull requests 读写权限。';
  else if (response.status === 404) message = '找不到 xvsf 仓库或 main 分支，请检查令牌的仓库访问范围。';
  else if (response.status === 409 || response.status === 422) message = 'GitHub 未接受提交，请检查分支保护和文章文件名后重试。';
  else message = `GitHub 请求失败（${response.status}），本机草稿仍在，请稍后重试。`;
  return Object.assign(new Error(message), { status: response.status });
}
async function request(route, token, init = {}, fetcher = fetch) {
  if (!token?.trim()) throw new Error('请先在 GitHub 设置中填写文章仓库令牌。');
  try {
    return await fetcher(`${API}${route}`, { ...init, redirect: 'error', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(45000),
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.trim()}`, 'X-GitHub-Api-Version': '2026-03-10', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  } catch { throw new Error('连接 GitHub 失败或超时。本机草稿仍在，重试时会先核对上次是否已提交。'); }
}
async function json(route, token, fetcher) {
  const response = await request(route, token, {}, fetcher);
  if (!response.ok) throw apiError(response);
  return response.json();
}
function checkedRaw(raw) {
  if (typeof raw !== 'string' || encoder.encode(raw).length > MAX_DOCUMENT_BYTES || raw.includes('\0')) throw new Error('文章必须是 UTF-8 Markdown，单篇不超过 2 MB。');
  return raw;
}
export function prepareArticle(raw) {
  checkedRaw(raw);
  const meta = readMetadata(raw);
  if (!splitMarkdown(raw).prefix || typeof meta.draft !== 'boolean' || !Array.isArray(meta.categories) || !Array.isArray(meta.tags)) throw new Error('请先在文章属性中填写标题、日期、分类、标签和文章状态。');
  if ([...meta.categories, ...meta.tags].some(value => typeof value !== 'string' || !value.trim())) throw new Error('分类和标签必须是非空文字。');
  for (const name of ['showToc', 'tocOpen', 'math', 'demoAlert']) if (meta[name] != null && typeof meta[name] !== 'boolean') throw new Error(`${name} 必须是 true 或 false。`);
  if (meta.draft === false && !String(meta.description || '').trim()) throw new Error('发布文章需要摘要，请先在文章属性中补充。');
  if (meta.draft === false && meta.cover?.image && !String(meta.cover.alt || '').trim()) throw new Error('封面图片需要 alt 描述，请在 Markdown 属性中补充后再同步。');
  return writeMetadata(raw, {});
}
export function publicationLabel(raw) {
  const meta = readMetadata(raw);
  if (meta.draft) return '草稿：保存到仓库，不出现在博客列表中。公开仓库中的 Markdown 仍可被访问。';
  if (meta.expiryDate && Date.parse(meta.expiryDate) <= Date.now()) return '已到下线时间：提交后不会出现在博客中。';
  if (Date.parse(meta.publishDate || meta.date) > Date.now()) return '定时文章：到达发布时间并完成定时构建后上线。';
  return '发布文章：保存后生成待合并的 PR；检查通过并合并到 main，博客构建成功后上线。';
}
async function readBlob(sha, token, fetcher) {
  const blob = await json(`/git/blobs/${sha}`, token, fetcher);
  if (blob.encoding !== 'base64' || blob.size > MAX_DOCUMENT_BYTES) throw new Error('文章编码不受支持或超过 2 MB。');
  const raw = checkedRaw(fromBase64(blob.content));
  if (await blobSha(raw) !== sha) throw new Error('文章内容校验失败，请重新读取 GitHub。');
  return raw;
}
export async function readArticle(path, token, fetcher, ref = articleRepository.branch) {
  checkedPath(path);
  const response = await request(`/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`, token, {}, fetcher);
  if (response.status === 404) return null;
  if (!response.ok) throw apiError(response);
  const item = await response.json();
  if (item.type !== 'file' || item.size > MAX_DOCUMENT_BYTES || !/^[a-f0-9]{40}$/.test(item.sha)) throw new Error('目标不是可同步的 Markdown 文件。');
  const raw = item.encoding === 'base64' ? checkedRaw(fromBase64(item.content)) : await readBlob(item.sha, token, fetcher);
  if (await blobSha(raw) !== item.sha) throw new Error('文章内容校验失败，请重新读取 GitHub。');
  return { path, sha: item.sha, raw, branch: ref };
}
async function workspacePulls(token, fetcher) {
  const result = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await json(`/pulls?state=open&base=main&per_page=100&page=${page}`, token, fetcher);
    if (!Array.isArray(batch)) throw new Error('无法读取待合并文章，请重试。');
    result.push(...batch.filter(pr => pr.head?.repo?.full_name?.toLowerCase() === articleRepository.repository.toLowerCase() && /^workbench\/post-[a-f0-9]{20}-[a-f0-9]{12}$/.test(pr.head.ref)));
    if (batch.length < 100) return result;
  }
  throw new Error('待合并请求过多，本次未更新文章，请先在 GitHub 整理。');
}
const pullInfo = pr => ({ branch: pr.head.ref, pullNumber: pr.number, pullURL: `https://github.com/${articleRepository.repository}/pull/${pr.number}` });
export async function listArticles(token, cached = [], onProgress = () => {}, fetcher) {
  const branch = await json(`/branches/${encodeURIComponent(articleRepository.branch)}`, token, fetcher);
  const tree = await json(`/git/trees/${branch.commit.sha}?recursive=1`, token, fetcher);
  if (tree.truncated || !Array.isArray(tree.tree)) throw new Error('GitHub 文章目录未返回完整结果，本次未更新目录。');
  const entries = tree.tree.filter(item => item.type === 'blob' && ['100644', '100755'].includes(item.mode) && item.path.startsWith(`${articleRepository.folder}/`) && !item.path.slice(articleRepository.folder.length + 1).includes('/') && /\.md$/i.test(item.path) && !/^_?index\.md$/i.test(item.path.split('/').at(-1)));
  const cache = new Map(cached.filter(doc => doc.github?.verified === true && doc.github?.repository === articleRepository.repository && doc.github?.branch === articleRepository.branch).map(doc => [doc.github.path, doc.github]));
  const result = new Array(entries.length); let next = 0, complete = 0, failure;
  await Promise.all(Array.from({ length: Math.min(4, entries.length) }, async () => {
    while (next < entries.length && !failure) {
      const index = next++, entry = entries[index];
      try {
        checkedPath(entry.path);
        if (entry.size > MAX_DOCUMENT_BYTES) throw new Error(`${entry.path} 超过 2 MB，本次未更新目录。`);
        const previous = cache.get(entry.path);
        const raw = previous?.sha === entry.sha && typeof previous.baseRaw === 'string' ? previous.baseRaw : await readBlob(entry.sha, token, fetcher);
        const github = { ...articleRepository, path: entry.path, sha: entry.sha, baseRaw: raw };
        const filename = entry.path.split('/').at(-1);
        const doc = updatedDocument({ id: await articleId(entry.path), filename, sourceFilename: filename, github, raw }, raw);
        result[index] = doc; onProgress(++complete, entries.length);
      } catch (error) { failure = error; }
    }
  }));
  if (failure) throw failure;
  const byPath = new Map(result.map(doc => [doc.github.path, doc]));
  const pendingPaths = new Set();
  for (const pr of await workspacePulls(token, fetcher)) {
    const files = await json(`/pulls/${pr.number}/files?per_page=100`, token, fetcher);
    if (files.length !== 1 || !['added', 'modified'].includes(files[0].status)) throw new Error(`PR #${pr.number} 不再是单篇文章更新，请先在 GitHub 处理。`);
    const file = files[0]; checkedPath(file.filename);
    const id = await articleId(file.filename);
    if (!pr.head.ref.startsWith(`workbench/post-${id}-`) || pendingPaths.has(file.filename)) throw new Error('同一篇文章有多个或不匹配的待合并版本，请先在 GitHub 整理。');
    pendingPaths.add(file.filename);
    const raw = await readBlob(file.sha, token, fetcher), filename = file.filename.split('/').at(-1);
    const github = { ...articleRepository, ...pullInfo(pr), path: file.filename, sha: file.sha, baseRaw: raw };
    byPath.set(file.filename, updatedDocument({ id, filename, sourceFilename: filename, github, raw }, raw));
  }
  return [...byPath.values()];
}
export async function saveArticle({ path, raw, baseSha }, token, fetcher) {
  checkedPath(path); checkedRaw(raw);
  const sha = await blobSha(raw), id = await articleId(path), prefix = `workbench/post-${id}-`;
  let pulls = (await workspacePulls(token, fetcher)).filter(pr => pr.head.ref.startsWith(prefix));
  if (pulls.length > 1) throw new Error('此文章有多个待合并 PR，请先在 GitHub 整理。');
  let pr = pulls[0], branch, current, commit, alreadyStored = false;
  if (pr) {
    branch = pr.head.ref;
    const files = await json(`/pulls/${pr.number}/files?per_page=100`, token, fetcher);
    if (files.length !== 1 || files[0].filename !== path || !['added', 'modified'].includes(files[0].status)) throw new Error(`PR #${pr.number} 包含其他更改，请先在 GitHub 检查后再同步。`);
    current = await readArticle(path, token, fetcher, branch);
    if (current) Object.assign(current, pullInfo(pr));
  } else {
    const main = await json('/branches/main', token, fetcher);
    current = await readArticle(path, token, fetcher, main.commit.sha);
    if (current) current.branch = 'main';
    if (current?.sha === sha) return { ...current, alreadyStored: true };
    if ((current?.sha || null) !== (baseSha || null)) throw new RemoteConflict(current);
    branch = `${prefix}${sha.slice(0, 12)}`;
    const existing = await request(`/branches/${encodeURIComponent(branch)}`, token, {}, fetcher);
    if (!existing.ok && existing.status !== 404) throw apiError(existing);
    if (existing.status === 404) {
      const created = await request('/git/refs', token, { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: main.commit.sha }) }, fetcher);
      if (!created.ok && created.status !== 422) throw apiError(created);
    }
    current = await readArticle(path, token, fetcher, branch);
  }
  if (current?.sha === sha) alreadyStored = true;
  else {
    if ((current?.sha || null) !== (baseSha || null)) throw new RemoteConflict(current);
    const response = await request(`/contents/${encodePath(path)}`, token, { method: 'PUT', body: JSON.stringify({ message: `${baseSha ? 'Update' : 'Create'} post: ${path.split('/').at(-1)}`, content: toBase64(raw), branch, ...(baseSha ? { sha: baseSha } : {}) }) }, fetcher);
    if (!response.ok) {
      if ([409, 422].includes(response.status)) {
        const latest = await readArticle(path, token, fetcher, branch);
        if (latest && pr) Object.assign(latest, pullInfo(pr));
        if (latest?.sha === sha) alreadyStored = true;
        else if ((latest?.sha || null) !== (baseSha || null)) throw new RemoteConflict(latest);
        else throw apiError(response);
      } else throw apiError(response);
    } else {
      const result = await response.json();
      if (result.content?.sha !== sha) throw new Error('GitHub 已响应但内容未核实，请重试核对，本机草稿已保留。');
      commit = result.commit?.sha;
    }
  }
  if (!pr) {
    const response = await request('/pulls', token, { method: 'POST', body: JSON.stringify({ title: `更新文章：${String(readMetadata(raw).title || path.split('/').at(-1)).slice(0, 180)}`, head: branch, base: 'main', body: `更新文章 \`${path}\`。\n\n由写作区保存；保留文章属性中的草稿与排期设置。检查通过并合并后，由现有 Pages 工作流构建。` }) }, fetcher);
    if (response.ok) pr = await response.json();
    else if (response.status === 422) pr = (await workspacePulls(token, fetcher)).find(item => item.head.ref === branch);
    if (!pr) throw new Error(`文章已保存到 ${branch}，但 PR 创建失败。请确认 Pull requests 读写权限，再重试同步；不会重复提交相同内容。`);
  }
  if (!Number.isInteger(pr.number) || !pr.head?.ref) throw new Error('文章已写入，但 PR 信息未核实，请重试同步。');
  const finalPull = await json(`/pulls/${pr.number}`, token, fetcher);
  if (finalPull.state !== 'open') {
    const main = await readArticle(path, token, fetcher);
    if (main?.sha === sha) return { ...main, alreadyStored: true };
    throw new Error('文章已保存到分支，但 PR 在同步期间被关闭或合并。请重新同步，核对最新版本后再提交。');
  }
  return { path, sha, raw, commit, alreadyStored, ...pullInfo(pr) };
}
