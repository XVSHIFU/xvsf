import { createHash } from 'node:crypto';
import { access, appendFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import sharp from 'sharp';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv.find((value) => ['--check', '--report', '--images', '--schedule'].includes(value)) ?? '--check';
const errors = [];
const warnings = [];
const notes = [];
const externalUrls = new Set();
const referencedImages = new Set();
const posts = [];

const knownBrokenImages = new Map([
  ['content/posts/hongri1.md', new Set(['image-20260308140255683.png'])],
  ['content/posts/JavaEE安全开发.md', new Set(['image-20250616155711895.png'])],
  ['content/posts/Shell编程知识汇总.md', new Set(['image-20260528152628001.png'])]
]);

function slash(value) {
  return value.replaceAll('\\', '/');
}

function rel(absolutePath) {
  return slash(path.relative(root, absolutePath));
}

function changedPaths() {
  const values = [];
  if (process.env.QUALITY_CHANGED_FILES) values.push(...process.env.QUALITY_CHANGED_FILES.split(/\r?\n/));
  for (let index = 0; index < process.argv.length; index += 1) {
    if (process.argv[index] === '--changed-file' && process.argv[index + 1]) values.push(process.argv[index + 1]);
  }
  return new Set(values.map((value) => slash(value.trim()).replace(/^\.\//, '')).filter(Boolean));
}

const changed = changedPaths();

async function exists(absolutePath) {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

function parseYaml(source, label) {
  const document = YAML.parseDocument(source, { prettyErrors: true, strict: true, uniqueKeys: true });
  if (document.errors.length) throw new Error(`${label}: ${document.errors.map((item) => item.message).join('; ')}`);
  return document.toJS();
}

function splitFrontMatter(source, filename) {
  const match = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${filename}: YAML front matter not found`);
  return { data: parseYaml(match[1], filename), body: source.slice(match[0].length) };
}

function dateValue(value) {
  if (!value) return null;
  let text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) text += 'T00:00:00+08:00';
  else if (/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}:\d{2}$/.test(text)) {
    text = text.replace(' ', 'T').replace(/T(\d):/, 'T0$1:') + '+08:00';
  }
  const result = new Date(text);
  return Number.isNaN(result.getTime()) ? null : result;
}

function termKey(value) {
  return String(value).normalize('NFKC').toLocaleLowerCase('zh-CN').replace(/\s+/gu, '').trim();
}

function normalizePath(value) {
  try {
    const parsed = new URL(value, 'https://xvshifu.github.io');
    let pathname = decodeURIComponent(parsed.pathname).normalize('NFKC').toLocaleLowerCase('zh-CN');
    pathname = pathname.replace(/^\/xvsf(?=\/|$)/, '').replace(/\/{2,}/g, '/');
    if (!pathname.startsWith('/')) pathname = `/${pathname}`;
    if (!path.extname(pathname) && !pathname.endsWith('/')) pathname += '/';
    return pathname;
  } catch {
    return String(value).normalize('NFKC').toLocaleLowerCase('zh-CN');
  }
}

function safeSiteLink(value) {
  if (!value) return true;
  if (/^(?:\/|\.\.?\/)/.test(value)) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function safeSocialLink(value) {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function markdownUrls(body) {
  const tree = unified().use(remarkParse).parse(body);
  const links = [];
  visit(tree, (node) => {
    if (['link', 'image', 'definition'].includes(node.type) && typeof node.url === 'string') {
      links.push({ url: node.url.trim(), image: node.type === 'image', alt: node.type === 'image' ? node.alt ?? '' : '' });
    }
  });
  return links;
}

function isExternal(value) {
  return /^https?:\/\//i.test(value);
}

function resolveImage(postPath, rawUrl) {
  let value = rawUrl.split('#')[0].split('?')[0];
  try { value = decodeURIComponent(value); } catch { /* keep source */ }
  if (!value || /^(?:https?:|data:|mailto:)/i.test(value)) return null;
  if (/^[A-Za-z]:[\\/]/.test(value)) return { windows: true, basename: path.win32.basename(value) };

  value = slash(value);
  let absolute;
  if (value.startsWith('/xvsf/')) absolute = path.join(root, 'static', value.slice('/xvsf/'.length));
  else if (value.startsWith('/')) absolute = path.join(root, 'static', value.slice(1));
  else if (value.startsWith('static/')) absolute = path.join(root, value);
  else absolute = path.resolve(root, path.dirname(postPath), value);
  return { absolute: path.resolve(absolute) };
}

async function loadSchema(filename) {
  return JSON.parse(await readFile(path.join(root, 'schemas', filename), 'utf8'));
}

const ajv = new Ajv({ allErrors: true, strict: true });
const validators = {
  frontmatter: ajv.compile(await loadSchema('frontmatter.schema.json')),
  taxonomy: ajv.compile(await loadSchema('taxonomy.schema.json')),
  friend: ajv.compile(await loadSchema('friend.schema.json')),
  site: ajv.compile(await loadSchema('site-params.schema.json'))
};

function validationMessages(label, validate) {
  for (const item of validate.errors ?? []) errors.push(`${label}${item.instancePath || '/'}: ${item.message}`);
}

async function yamlCollection(directory, validator, label) {
  const absoluteDir = path.join(root, directory);
  if (!(await exists(absoluteDir))) return [];
  const result = [];
  for (const filename of (await readdir(absoluteDir)).filter((value) => /\.ya?ml$/i.test(value)).sort()) {
    const absolutePath = path.join(absoluteDir, filename);
    try {
      const data = parseYaml(await readFile(absolutePath, 'utf8'), `${directory}/${filename}`);
      if (!validator(data)) validationMessages(`${directory}/${filename}`, validator);
      result.push({ filename, path: `${directory}/${filename}`, data });
    } catch (error) {
      errors.push(error.message);
    }
  }
  notes.push(`${label}: ${result.length}`);
  return result;
}

const categoryEntries = await yamlCollection('data/categories', validators.taxonomy, '分类词条');
const tagEntries = await yamlCollection('data/tags', validators.taxonomy, '标签词条');
const friendEntries = await yamlCollection('data/friends', validators.friend, '友情链接');

function validateTerms(entries, label) {
  const names = new Set();
  const normalized = new Map();
  for (const entry of entries) {
    const name = String(entry.data?.name ?? '').trim();
    names.add(name);
    const key = termKey(name);
    if (normalized.has(key)) errors.push(`${label}近重复：${normalized.get(key)} / ${name}`);
    else normalized.set(key, name);
  }
  return names;
}

const categoryNames = validateTerms(categoryEntries, '分类');
const tagNames = validateTerms(tagEntries, '标签');

const sitePath = path.join(root, 'config', '_default', 'params.yaml');
let siteParams = {};
try {
  siteParams = parseYaml(await readFile(sitePath, 'utf8'), rel(sitePath));
  if (!validators.site(siteParams)) validationMessages(rel(sitePath), validators.site);
  if (siteParams.announcement?.enabled && !String(siteParams.announcement.text ?? '').trim()) {
    errors.push('网站公告已启用，但公告内容为空');
  }
  if (!safeSiteLink(siteParams.announcement?.url ?? '')) errors.push('网站公告链接不是安全的站内或 HTTP(S) 地址');
  for (const icon of siteParams.socialIcons ?? []) {
    if (!safeSocialLink(icon.url)) errors.push(`社交链接 ${icon.name} 的地址不合法`);
  }
} catch (error) {
  errors.push(error.message);
}

const postFiles = (await readdir(path.join(root, 'content', 'posts')))
  .filter((value) => value.toLowerCase().endsWith('.md'))
  .sort((a, b) => a.localeCompare(b, 'zh-CN'));

for (const filename of postFiles) {
  const postPath = `content/posts/${filename}`;
  try {
    const { data, body } = splitFrontMatter(await readFile(path.join(root, postPath), 'utf8'), postPath);
    const isChanged = changed.has(postPath);
    if (!validators.frontmatter(data)) validationMessages(postPath, validators.frontmatter);
    const publishDate = dateValue(data.publishDate);
    const expiryDate = dateValue(data.expiryDate);

    if (data.publishDate && !publishDate) errors.push(`${postPath}: publishDate 无法解析`);
    if (data.expiryDate && !expiryDate) errors.push(`${postPath}: expiryDate 无法解析`);
    if (publishDate && data.draft === true) errors.push(`${postPath}: 已设置 publishDate，但 draft 仍为 true`);
    if (publishDate && expiryDate && publishDate >= expiryDate) errors.push(`${postPath}: publishDate 必须早于 expiryDate`);

    for (const category of data.categories ?? []) {
      if (!categoryNames.has(category)) errors.push(`${postPath}: 分类“${category}”不在分类词库中`);
    }
    for (const tag of data.tags ?? []) {
      if (!tagNames.has(tag)) errors.push(`${postPath}: 标签“${tag}”不在标签词库中`);
    }

    const title = String(data.title ?? '').trim();
    const description = String(data.description ?? '').trim();
    if (title.length > 60) warnings.push(`${postPath}: 标题超过 60 字符`);
    if (!description) {
      const message = `${postPath}: 缺少 SEO 描述`;
      if (isChanged && data.draft === false) errors.push(message); else warnings.push(message);
    } else if (description.length < 50 || description.length > 160) {
      warnings.push(`${postPath}: SEO 描述长度为 ${description.length}，建议 50–160 字符`);
    }
    if (data.cover?.image && !String(data.cover.alt ?? '').trim()) {
      const message = `${postPath}: 封面缺少 alt`;
      if (isChanged && data.draft === false) errors.push(message); else warnings.push(message);
    } else if (!data.cover?.image) {
      warnings.push(`${postPath}: 未设置封面`);
    }

    const urls = markdownUrls(body);
    for (const item of urls) {
      if (isExternal(item.url)) {
        if (isChanged || process.argv.includes('--all-external')) externalUrls.add(item.url);
        continue;
      }
      if (!item.image) continue;
      if (!item.alt.trim()) warnings.push(`${postPath}: 正文图片缺少 alt：${item.url}`);
      const resolved = resolveImage(postPath, item.url);
      if (!resolved) continue;
      if (resolved.windows) {
        if (!knownBrokenImages.get(postPath)?.has(resolved.basename)) errors.push(`${postPath}: 本地 Windows 图片路径不可发布：${item.url}`);
        continue;
      }
      referencedImages.add(resolved.absolute);
      if (!(await exists(resolved.absolute))) errors.push(`${postPath}: 图片不存在：${item.url}`);
    }

    if (data.cover?.image) {
      const resolved = resolveImage(postPath, data.cover.image);
      if (resolved?.absolute) {
        referencedImages.add(resolved.absolute);
        if (!(await exists(resolved.absolute))) errors.push(`${postPath}: 封面图片不存在：${data.cover.image}`);
      }
    }
    posts.push({ filename, path: postPath, data, body, urls });
  } catch (error) {
    errors.push(error.message);
  }
}

const routes = new Map();
for (const post of posts) {
  const basename = path.basename(post.filename, path.extname(post.filename));
  const canonical = normalizePath(`/posts/${post.data.slug || basename}/`);
  for (const route of [canonical, ...(post.data.aliases ?? []).map(normalizePath)]) {
    if (routes.has(route) && routes.get(route) !== post.path) errors.push(`重复链接 ${route}: ${routes.get(route)} / ${post.path}`);
    else routes.set(route, post.path);
  }
}

const friendNames = new Map();
const friendUrls = new Map();
for (const entry of friendEntries) {
  const nameKey = termKey(entry.data.name ?? '');
  let urlKey = '';
  try {
    const url = new URL(entry.data.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
    url.hash = '';
    urlKey = url.toString().replace(/\/$/, '').toLocaleLowerCase('en-US');
  } catch {
    errors.push(`${entry.path}: 友情链接必须使用 HTTP(S) 地址`);
  }
  if (friendNames.has(nameKey)) errors.push(`友情链接名称重复：${friendNames.get(nameKey)} / ${entry.data.name}`);
  else friendNames.set(nameKey, entry.data.name);
  if (urlKey && friendUrls.has(urlKey)) errors.push(`友情链接地址重复：${entry.data.url}`);
  else if (urlKey) friendUrls.set(urlKey, entry.path);
  if (entry.data.avatar) {
    const resolved = resolveImage(entry.path, entry.data.avatar);
    if (resolved?.absolute) referencedImages.add(resolved.absolute);
  }
}

for (const value of [siteParams.authorProfile?.avatar, siteParams.homeInfoParams?.imageUrl, ...(siteParams.images ?? [])]) {
  if (!value) continue;
  const resolved = resolveImage('config/_default/params.yaml', value);
  if (resolved?.absolute) referencedImages.add(resolved.absolute);
}

async function recursiveFiles(directory) {
  if (!(await exists(directory))) return [];
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await recursiveFiles(absolute));
    else if (entry.isFile() && entry.name !== '.gitkeep') result.push(absolute);
  }
  return result;
}

async function auditImages() {
  const files = await recursiveFiles(path.join(root, 'static', 'uploads'));
  const hashes = new Map();
  const report = { files: [], unused: [], duplicateGroups: [], oversized: [], unreadable: [] };
  for (const absolute of files) {
    const relative = rel(absolute);
    try {
      const bytes = await readFile(absolute);
      const metadata = await sharp(bytes, { animated: true }).metadata();
      const hash = createHash('sha256').update(bytes).digest('hex');
      const item = { path: relative, bytes: bytes.length, width: metadata.width ?? null, height: metadata.height ?? null, sha256: hash, referenced: referencedImages.has(path.resolve(absolute)) };
      report.files.push(item);
      if (!item.referenced) report.unused.push(relative);
      if (bytes.length > 2 * 1024 * 1024 || (metadata.width ?? 0) > 2560 || (metadata.height ?? 0) > 2560) report.oversized.push(relative);
      const group = hashes.get(hash) ?? [];
      group.push(relative);
      hashes.set(hash, group);
    } catch (error) {
      report.unreadable.push({ path: relative, error: error.message });
    }
  }
  report.duplicateGroups = [...hashes.values()].filter((group) => group.length > 1);
  for (const value of report.unused) warnings.push(`未使用图片：${value}`);
  for (const value of report.oversized) warnings.push(`超大图片：${value}`);
  for (const group of report.duplicateGroups) warnings.push(`重复图片：${group.join(' / ')}`);
  for (const item of report.unreadable) warnings.push(`无法读取图片：${item.path} (${item.error})`);

  const outputArgument = process.argv.indexOf('--json-output');
  const outputPath = outputArgument >= 0 ? process.argv[outputArgument + 1] : process.env.IMAGE_AUDIT_OUTPUT;
  if (outputPath) {
    const absoluteOutput = path.resolve(root, outputPath);
    await mkdir(path.dirname(absoluteOutput), { recursive: true });
    await writeFile(absoluteOutput, `${JSON.stringify(report, null, 2)}\n`);
  }
  notes.push(`上传图片：${files.length}；未使用 ${report.unused.length}；重复组 ${report.duplicateGroups.length}；超大 ${report.oversized.length}`);
  return report;
}

if (mode === '--images' || mode === '--report') await auditImages();

const externalOutputIndex = process.argv.indexOf('--external-output');
const externalOutput = externalOutputIndex >= 0 ? process.argv[externalOutputIndex + 1] : process.env.EXTERNAL_URL_OUTPUT;
if (externalOutput) {
  const absoluteOutput = path.resolve(root, externalOutput);
  await mkdir(path.dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, [...externalUrls].sort().join('\n') + (externalUrls.size ? '\n' : ''));
}

const summary = [
  '## 内容质量报告',
  '',
  `- 文章：${posts.length}`,
  `- 错误：${errors.length}`,
  `- 警告：${warnings.length}`,
  `- 改动文章外链：${externalUrls.size}`,
  ...notes.map((value) => `- ${value}`),
  '',
  ...(errors.length ? ['### 错误', '', ...errors.map((value) => `- ${value}`), ''] : []),
  ...(warnings.length ? ['### 警告', '', ...warnings.slice(0, 200).map((value) => `- ${value}`), warnings.length > 200 ? `- 其余 ${warnings.length - 200} 条已省略` : '', ''] : [])
].filter((value) => value !== '').join('\n');

console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);

if ((mode === '--check' || mode === '--schedule') && errors.length) process.exit(1);
