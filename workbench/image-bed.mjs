export const defaultImageBed = { repository: 'XVSHIFU/Picture-bed', branch: 'img', folder: 'img', linkStyle: 'raw' };
const API = 'https://api.github.com';
const MAX_BYTES = 10 * 1024 * 1024;

export function normalizeImageBed(input) {
  const repository = String(input.repository || '').trim();
  const branch = String(input.branch || '').trim();
  const folder = String(input.folder || '').trim().replace(/^\/+|\/+$/g, '');
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error('仓库请填写“用户名/仓库名”。');
  if (!branch || /[\s\x00-\x1f~^:?*\[\\]/.test(branch) || branch.includes('..') || branch.includes('@{')) throw new Error('请填写有效的分支名称。');
  if (folder && folder.split('/').some(part => !part || part === '.' || part === '..' || /[\\\x00-\x1f<>:"|?*]/.test(part))) throw new Error('图片目录不能包含 .. 或特殊路径字符。');
  return { repository, branch, folder, linkStyle: input.linkStyle === 'jsdelivr' ? 'jsdelivr' : 'raw' };
}

function apiError(response) {
  if (response.status === 401) return new Error('令牌无效或已过期，请重新配置。');
  if (response.status === 403 || response.status === 429) return new Error('GitHub 拒绝了请求。请检查图床仓库的 Contents 读写权限，或稍后重试。');
  if (response.status === 404) return new Error('找不到仓库或分支，请检查名称与令牌访问范围。');
  if (response.status === 409 || response.status === 422) return new Error('GitHub 未接受这次上传。请检查分支保护或稍后重试。');
  return new Error(`GitHub 请求未完成（${response.status}），请稍后重试。`);
}

async function request(path, token, init = {}, fetcher = fetch) {
  if (!token?.trim()) throw new Error('请先在“图床设置”中填写 GitHub 令牌。');
  try {
    return await fetcher(`${API}${path}`, { ...init, redirect: 'error', credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(45000), headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.trim()}`, 'X-GitHub-Api-Version': '2026-03-10', ...(init.body ? { 'Content-Type': 'application/json' } : {}) } });
  } catch { throw new Error('连接 GitHub 失败或超时。图片仍在待传列表中，重试会先检查是否已经上传。'); }
}

export async function checkImageBed(config, token, fetcher) {
  const settings = normalizeImageBed(config);
  for (const path of [`/repos/${settings.repository}`, `/repos/${settings.repository}/branches/${encodeURIComponent(settings.branch)}`]) {
    const response = await request(path, token, {}, fetcher);
    if (!response.ok) throw apiError(response);
  }
  return settings;
}

export async function prepareImage(file, config) {
  if (!file.size || file.size > MAX_BYTES) throw new Error('请使用不超过 10 MB 的图片。');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const starts = prefix => prefix.every((value, index) => bytes[index] === value);
  let extension;
  if (starts([137,80,78,71,13,10,26,10])) extension = 'png';
  else if (starts([255,216,255])) extension = 'jpg';
  else if (['GIF87a','GIF89a'].includes(String.fromCharCode(...bytes.slice(0,6)))) extension = 'gif';
  else if (String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') extension = 'webp';
  if (!extension) throw new Error('支持 PNG、JPG、GIF、WebP 图片；文件内容必须与图片格式相符。');
  const settings = normalizeImageBed(config);
  const day = new Date().toISOString().slice(0,10).replaceAll('-', '/');
  const basename = file.name.replace(/\.[^.]*$/, '').replace(/[^\p{L}\p{N}_-]/gu, '-').slice(0,50) || 'image';
  const path = [settings.folder, day, `${Date.now()}-${crypto.randomUUID().slice(0,8)}-${basename}.${extension}`].filter(Boolean).join('/');
  const header = new TextEncoder().encode(`blob ${bytes.length}\0`);
  const blob = new Uint8Array(header.length + bytes.length); blob.set(header); blob.set(bytes, header.length);
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-1', blob))].map(value => value.toString(16).padStart(2,'0')).join('');
  let binary = ''; for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return { settings, path, sha, content: btoa(binary), name: file.name };
}

export function imageUrl(plan) {
  const { settings, path } = plan;
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return settings.linkStyle === 'jsdelivr'
    ? `https://cdn.jsdelivr.net/gh/${settings.repository}@${encodeURIComponent(settings.branch)}/${encodedPath}`
    : `https://raw.githubusercontent.com/${settings.repository}/${encodeURIComponent(settings.branch)}/${encodedPath}`;
}

export async function uploadImage(plan, token, fetcher) {
  const path = `/repos/${plan.settings.repository}/contents/${plan.path.split('/').map(encodeURIComponent).join('/')}`;
  const existing = await request(`${path}?ref=${encodeURIComponent(plan.settings.branch)}`, token, {}, fetcher);
  if (existing.ok) {
    if ((await existing.json()).sha === plan.sha) return imageUrl(plan);
    throw new Error('目标位置已有其他图片，本次未覆盖。请重新选择图片生成新文件名。');
  }
  if (existing.status !== 404) throw apiError(existing);
  const response = await request(path, token, { method: 'PUT', body: JSON.stringify({ message: `Upload image: ${plan.name}`, content: plan.content, branch: plan.settings.branch }) }, fetcher);
  if (!response.ok) throw apiError(response);
  return imageUrl(plan);
}
