const { default: YAML } = await import(typeof window === 'undefined' ? 'yaml' : './vendor/yaml/browser/index.js');

export function splitMarkdown(raw) {
  const match = raw.match(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  return { prefix: match?.[0] || '', body: raw.slice(match?.[0].length || 0) };
}

export function exportMarkdown(original, draft) {
  if (!draft) return original;
  return (draft.prefix ?? splitMarkdown(original).prefix) + draft.body;
}

const fieldOrder = ['title', 'date', 'publishDate', 'expiryDate', 'draft', 'description', 'categories', 'tags', 'showToc', 'tocOpen', 'math', 'demoAlert', 'slug', 'aliases', 'cover', 'lastmod'];
export function readMetadata(raw) {
  const { prefix } = splitMarkdown(raw);
  if (!prefix) return {};
  const document = YAML.parseDocument(prefix.replace(/^\uFEFF?---\r?\n/, '').replace(/^---\r?\n/, '').replace(/\r?\n---\r?\n?$/, ''));
  if (document.errors.length) throw new Error('文章属性格式有误，请先导出原文检查。');
  const value = document.toJS();
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('文章属性必须是 YAML 对象。');
  return value;
}
export function normalizeDate(value) {
  const text = String(value || '').trim().replace(/\.\d{3}(?=Z$)/, '');
  if (!/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})?)?$/.test(text) || !Number.isFinite(Date.parse(text))) throw new Error('日期请使用 YYYY-MM-DD 或完整日期时间，例如 2026-10-08T10:00:00+08:00。');
  return text;
}
export function writeMetadata(original, patch) {
  const data = { ...readMetadata(original), ...patch };
  data.title = String(data.title || '').trim();
  if (!data.title) throw new Error('请填写文章标题。');
  data.date = normalizeDate(data.date);
  for (const key of ['categories', 'tags']) data[key] = [...new Set((data[key] || []).map(item => String(item).trim()).filter(Boolean))];
  if (!data.categories.length) throw new Error('请至少填写一个分类。');
  for (const key of ['publishDate', 'expiryDate']) {
    if (!data[key]) delete data[key];
    else { data[key] = normalizeDate(data[key]); if (data[key].length === 10) data[key] += 'T00:00:00+08:00'; }
  }
  if (data.publishDate && data.draft) throw new Error('设置定时发布时，请将文章状态改为“准备发布”。');
  if (data.publishDate && data.expiryDate && Date.parse(data.expiryDate) <= Date.parse(data.publishDate)) throw new Error('下线时间必须晚于发布时间。');
  const ordered = {};
  for (const key of [...fieldOrder, ...Object.keys(data)]) if (Object.hasOwn(data, key)) ordered[key] = data[key];
  return `---\n${YAML.stringify(ordered, { blockQuote: 'literal', lineWidth: 0, minContentWidth: 0 })}---\n` + splitMarkdown(original).body;
}

export function updatedDocument(doc, raw) {
  const meta = readMetadata(raw);
  return { ...doc, title: String(meta.title || doc.title), date: String(meta.date || ''), categories: meta.categories || [], tags: meta.tags || [], draft: meta.draft === true };
}

export function recoveryDocument(doc, raw) {
  const result = newDocument(`${doc.title}（冲突副本）`, doc.categories[0] || '未分类');
  if (doc.sample) raw = splitMarkdown(result.raw).prefix + raw;
  result.raw = writeMetadata(raw, { title: result.title, draft: true, publishDate: undefined, expiryDate: undefined });
  return updatedDocument(result, result.raw);
}

export function groupDocuments(docs, query = '') {
  const groups = new Map();
  const needle = query.trim().toLocaleLowerCase();
  for (const doc of docs) {
    if (doc.id === 'welcome' || doc.deletedAt) continue;
    const categories = [...new Set(doc.categories?.length ? doc.categories : ['未分类'])];
    if (needle && ![doc.title, doc.filename, ...categories].join(' ').toLocaleLowerCase().includes(needle)) continue;
    for (const category of categories) {
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(doc);
    }
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b, 'zh-CN')).map(([name, documents]) => ({
    name,
    documents: documents.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || a.title.localeCompare(b.title, 'zh-CN'))
  }));
}

export function newDocument(title, category, id = crypto.randomUUID()) {
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const filename = title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').slice(0, 90) + '.md';
  const categories = [category || '未分类'];
  const raw = writeMetadata('', { title, date, draft: true, categories, tags: [] }) + '\n';
  return { id: `local-${id}`, title, filename, categories, tags: [], date, draft: true, local: true, raw };
}
