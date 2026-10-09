import { splitMarkdown, readMetadata, updatedDocument, newDocument, exportMarkdown } from './model.mjs';

export const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;
const bytes = value => new TextEncoder().encode(value).length;
export function validFilename(value) {
  const name = String(value || '').trim();
  if (!name || name.length > 160 || !/\.md$/i.test(name) || /[<>:"/\\|?*\x00-\x1f]/.test(name) || name.startsWith('.') || /[. ]\.md$/i.test(name) || /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(name)) throw new Error('文件名应以 .md 结尾，不能包含路径、系统保留名称或特殊符号。');
  return name;
}
export function availableFilename(name, documents, exceptId) {
  const value = validFilename(name);
  if (documents.some(doc => doc.id !== exceptId && doc.filename.toLocaleLowerCase() === value.toLocaleLowerCase())) throw new Error('已有同名文章（包括回收站），请换一个文件名。');
  return value;
}
export function uniqueFilename(name, documents) {
  const value = validFilename(name), used = new Set(documents.map(doc => doc.filename.toLocaleLowerCase()));
  let candidate = value, number = 2;
  while (used.has(candidate.toLocaleLowerCase())) candidate = `${value.slice(0, -3).slice(0, 140)} (${number++}).md`;
  return candidate;
}
function checkedMetadata(filename, raw) {
  const meta = readMetadata(raw);
  if (meta.categories != null && (!Array.isArray(meta.categories) || meta.categories.some(item => typeof item !== 'string'))) throw new Error(`${filename} 的 categories 应是文字列表。`);
  if (meta.tags != null && (!Array.isArray(meta.tags) || meta.tags.some(item => typeof item !== 'string'))) throw new Error(`${filename} 的 tags 应是文字列表。`);
  return meta;
}
export function importedDocument(filename, raw, documents = []) {
  if (typeof raw !== 'string' || bytes(raw) > MAX_DOCUMENT_BYTES || raw.includes('\0')) throw new Error('文章需为 UTF-8 Markdown，单篇不超过 2 MB。');
  const name = uniqueFilename(filename, documents);
  const meta = checkedMetadata(filename, raw);
  const title = String(meta.title || filename.slice(0, -3));
  const doc = newDocument(title, meta.categories?.[0] || '未分类');
  doc.filename = name;
  doc.raw = splitMarkdown(raw).prefix ? raw : splitMarkdown(doc.raw).prefix + raw;
  return updatedDocument(doc, doc.raw);
}
export function nextHistory(latest, record) {
  const history = [...(latest?.history || [])];
  const previous = latest ? { raw: exportMarkdown(record.historySeed?.raw || '', latest), filename: latest.document?.filename || record.document.filename, at: latest.updatedAt, reason: record.historyReason || '自动保存' } : record.historySeed;
  if (previous && (previous.raw !== exportMarkdown('', record) || previous.filename !== record.document.filename || latest?.document?.deletedAt !== record.document.deletedAt)) {
    if (record.historyReason || !history.length || Date.now() - history.at(-1).at >= 60_000) history.push(previous);
  }
  let size = history.reduce((sum, item) => sum + bytes(item.raw), 0);
  while (history.length > 20 || (size > 4 * 1024 * 1024 && history.length > 1)) size -= bytes(history.shift().raw);
  return history;
}
export function createBackup(records) {
  return JSON.stringify({ format: 'xvsf-workbench-backup', version: 1, createdAt: new Date().toISOString(), documents: records.filter(record => record.id !== 'welcome').map(record => ({
    filename: record.document.filename, raw: exportMarkdown('', record), deletedAt: record.document.deletedAt || null,
    history: (record.history || []).map(item => ({ raw: item.raw, filename: item.filename, at: item.at, reason: item.reason }))
  })) }, null, 2);
}
export function parseBackup(text, documents = []) {
  if (bytes(text) > 50 * 1024 * 1024) throw new Error('备份文件不能超过 50 MB。');
  let backup;
  try { backup = JSON.parse(text); } catch { throw new Error('这不是有效的工作区 JSON 备份。'); }
  if (backup?.format !== 'xvsf-workbench-backup' || backup.version !== 1 || !Array.isArray(backup.documents) || backup.documents.length > 500) throw new Error('备份格式或版本不受支持，单次最多恢复 500 篇。');
  const names = [...documents];
  return backup.documents.map(item => {
    const doc = importedDocument(item.filename, item.raw, names); names.push(doc);
    if (item.deletedAt != null) { if (!Number.isFinite(item.deletedAt)) throw new Error('备份中的回收站日期无效。'); doc.deletedAt = item.deletedAt; }
    const history = item.history || [];
    if (!Array.isArray(history) || history.length > 20) throw new Error('备份中的历史版本无效。');
    let size = 0;
    const clean = history.map(entry => {
      if (typeof entry.raw !== 'string' || bytes(entry.raw) > MAX_DOCUMENT_BYTES || !Number.isFinite(entry.at) || !splitMarkdown(entry.raw).prefix) throw new Error('备份中的历史版本不完整。');
      size += bytes(entry.raw); validFilename(entry.filename); checkedMetadata(entry.filename, entry.raw);
      return { raw: entry.raw, filename: entry.filename, at: entry.at, reason: String(entry.reason || '恢复的历史版本').slice(0, 60) };
    });
    if (size > 4 * 1024 * 1024) throw new Error('单篇历史版本合计不能超过 4 MB。');
    return { document: doc, history: clean };
  });
}
