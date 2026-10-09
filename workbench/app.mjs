import { splitMarkdown, exportMarkdown, groupDocuments, newDocument, readMetadata, writeMetadata, updatedDocument, recoveryDocument } from './model.mjs';
import { allDrafts, saveDraft, DraftConflict, readDraft, importDrafts, allSources, cacheSources } from './store.mjs';
import { setupImageBed } from './image-ui.mjs';
import { setupWorkspace } from './workspace-ui.mjs';
import { availableFilename, uniqueFilename } from './workspace-model.mjs';
import { setupGitHub } from './github-ui.mjs';
import { articleRepository, articlePath, prepareArticle } from './github.mjs';

const $ = id => document.getElementById(id);
const icon = name => { const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const use = document.createElementNS(el.namespaceURI, 'use'); use.setAttribute('href', `#i-${name}`); el.append(use); el.setAttribute('aria-hidden', 'true'); return el; };
const element = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; };
const welcomeBody = "# 把文章放回熟悉的工作区\n\n左侧按分类整理文章，顶部标签可以切换多篇文档。\n\n## 连接博客\n\n点击顶部 **GitHub**，填写授权 `XVSHIFU/xvsf` 仓库的令牌，再选择 **连接并读取文章**。连接只读取文章，不会提交修改。\n\n## 写作与同步\n\n输入会自动保存到当前浏览器，也可以按 **Ctrl S**。本机草稿不会自动上传。准备好后点击文章栏的 **同步**，确认文章状态和目标路径，再保存到 GitHub。工作区会创建或更新 PR，检查通过后在 GitHub 合并。\n\n新文章默认是草稿。需要发布时，在文章属性中补充摘要并改为“准备发布”，然后同步。公开仓库里的草稿 Markdown 仍可被访问。\n\n## 图片与预览\n\n图床单独配置为 `XVSHIFU/Picture-bed`，图片可粘贴、拖入或通过图片按钮上传。本地服务提供 Hugo 博客预览；GitHub Pages 上提供 Markdown 预览。\n\n## 备份与恢复\n\n“更多文章操作”中可以导出 Markdown、查看历史或移入本机回收站。“文章管理”中可以备份全部草稿、导入文章及恢复回收站。回收站只影响本机，不会删除 GitHub 文件。\n\n刷新后需重新填写令牌，本机草稿仍保留。更换浏览器或网址前，请先备份草稿。\n";
const welcome = { id: 'welcome', title: '开始体验', filename: '开始体验.md', categories: [], tags: [], raw: welcomeBody, sample: true };
const documents = new Map([[welcome.id, welcome]]);
const originals = new Map([[welcome.id, welcomeBody]]);
const drafts = new Map();
const revisions = new Map(), saveQueues = new Map(), lastSaved = new Map(), editRoutes = new Map(), saveErrors = new Set();
const expanded = new Set();
let tabs = ['welcome'], activeId = null, editor, ready = false, switching = false, userEdited = false, currentCanonical = '', opening = 0, pendingSaves = 0, saveFailed = false, toastTimer;
const vendor = new URL('vendor/vditor', location.href).href.replace(/\/$/, '');
let theme = 'dark';
let metadataRoute = null;
let github;
let localPreview = false;
try { theme = localStorage.getItem('xvsf-workbench-theme') === 'light' ? 'light' : 'dark'; } catch {}

let toastDuration = 3400, toastReturnFocus;
function dismissToast() {
  clearTimeout(toastTimer);
  const restoreFocus = $('toast').contains(document.activeElement);
  $('toast').hidden = true;
  if (restoreFocus && toastReturnFocus?.isConnected) toastReturnFocus.focus({ preventScroll: true });
}
function scheduleToast() {
  clearTimeout(toastTimer);
  if (toastDuration && !$('toast').matches(':hover, :focus-within')) toastTimer = setTimeout(dismissToast, toastDuration);
}
function toast(message, { kind = 'info', duration = 3400, action } = {}) {
  if (!$('toast').contains(document.activeElement)) toastReturnFocus = document.activeElement;
  $('toast-message').textContent = message;
  $('toast').dataset.kind = kind;
  $('toast-icon').setAttribute('href', kind === 'error' ? '#i-alert' : kind === 'success' ? '#i-check' : '#i-file');
  $('toast-action').hidden = !action;
  $('toast-action').textContent = action?.label || '';
  $('toast-action').onclick = action ? () => { dismissToast(); action.run(); } : null;
  $('toast').hidden = false; toastDuration = duration; scheduleToast();
}
$('toast-close').addEventListener('click', dismissToast);
for (const event of ['pointerenter', 'focusin']) $('toast').addEventListener(event, () => clearTimeout(toastTimer));
for (const event of ['pointerleave', 'focusout']) $('toast').addEventListener(event, () => queueMicrotask(scheduleToast));
function updateSaveStatus() {
  saveFailed = saveErrors.size > 0;
  $('save-status').textContent = saveFailed ? '本机保存失败 · 请导出副本' : pendingSaves ? '正在保存到本机…' : activeId && drafts.has(activeId) ? '已保存到本机' : '文章副本 · 可放心试写';
  const doc = documents.get(activeId);
  $('github-status').textContent = !doc || doc.sample ? '示例文章' : doc.remoteMissing ? '远端已删除 · 本机已保留' : doc.remoteChanged ? '远端有更新 · 本机已保留' : !doc.github ? '尚未同步 GitHub' : hasLocalChanges(doc) ? '本机修改待同步' : doc.github.pullNumber ? `已保存 GitHub · PR #${doc.github.pullNumber} 待合并` : doc.github.verified ? '已与 GitHub 同步' : '本机文章副本';
  $('github-view-pull').disabled = !Number.isInteger(doc?.github?.pullNumber);
  github?.update();
}
function hasLocalChanges(doc) {
  if (doc.deletedAt) return true;
  if (!doc.github) return !!doc.local || drafts.has(doc.id);
  if (!drafts.has(doc.id)) return false;
  return currentRaw(doc.id) !== doc.github.baseRaw;
}
function setTheme(next) {
  theme = next;
  document.documentElement.dataset.theme = theme;
  $('theme-toggle').setAttribute('aria-label', theme === 'dark' ? '切换为浅色主题' : '切换为深色主题');
  try { localStorage.setItem('xvsf-workbench-theme', theme); } catch {}
  if (ready) editor.setTheme(theme === 'dark' ? 'dark' : 'classic', theme === 'dark' ? 'dark' : 'light', theme === 'dark' ? 'github-dark' : 'github', `${vendor}/dist/css/content-theme`);
}
function sidebarVisible(visible) {
  document.body.classList.toggle('sidebar-collapsed', !visible);
  $('sidebar-toggle').setAttribute('aria-expanded', String(visible));
  $('sidebar-toggle').setAttribute('aria-label', visible ? '收起笔记本' : '展开笔记本');
  $('drawer-backdrop').hidden = !visible || !matchMedia('(max-width: 760px)').matches;
  $('writing-area').inert = visible && matchMedia('(max-width: 760px)').matches;
}
function renderLibrary() {
  const query = $('search').value;
  const groups = groupDocuments([...documents.values()], query);
  const host = $('notebooks');
  const previousScroll = host.scrollTop;
  host.replaceChildren();
  for (const group of groups) {
    const folder = element('details', 'notebook');
    folder.dataset.category = group.name;
    folder.open = !!query || expanded.has(group.name);
    const summary = element('summary');
    const chevron = icon('chevron'); chevron.classList.add('chevron');
    const book = icon('book'); book.classList.add('notebook-icon');
    const label = element('span', 'notebook-name', group.name); label.title = group.name;
    summary.append(chevron, book, label, element('span', 'notebook-count', String(group.documents.length)));
    folder.append(summary);
    folder.addEventListener('toggle', () => { if (!query) { if (folder.open) expanded.add(group.name); else expanded.delete(group.name); } });
    for (const doc of group.documents) {
      const button = element('button', `file-row${activeId === doc.id ? ' active' : ''}`);
      button.type = 'button'; button.dataset.id = doc.id; button.title = `${doc.title}\n${doc.filename}`;
      if (activeId === doc.id) button.setAttribute('aria-current', 'page');
      button.append(icon('file'), element('span', '', doc.title));
      if (hasLocalChanges(doc)) { const dot = element('span', 'local-dot'); dot.setAttribute('aria-label', '有本机草稿'); button.append(dot); }
      button.addEventListener('click', () => openDocument(doc.id));
      folder.append(button);
    }
    host.append(folder);
  }
  if (!groups.length) host.append(element('p', 'sidebar-message', query ? '没有找到文章。换个关键词或清空搜索再看看。' : '点击顶部 GitHub 读取文章，或用加号先创建本机草稿。'));
  const ids = new Set(groups.flatMap(group => group.documents.map(doc => doc.id)));
  $('library-count').textContent = `${ids.size} 篇`;
  $('welcome-button').classList.toggle('active', activeId === 'welcome');
  host.scrollTop = previousScroll;
}
function updateActiveRows() {
  document.querySelectorAll('.file-row').forEach(row => { const isActive = row.dataset.id === activeId; row.classList.toggle('active', isActive); if (isActive) row.setAttribute('aria-current', 'page'); else row.removeAttribute('aria-current'); });
  $('welcome-button').classList.toggle('active', activeId === 'welcome');
}
function renderTabs() {
  $('tabs').replaceChildren();
  for (const id of tabs) {
    const doc = documents.get(id);
    const item = element('div', `tab-item${id === activeId ? ' active' : ''}`); item.setAttribute('role', 'presentation');
    const select = element('button', 'tab-select'); select.type = 'button'; select.id = `tab-${id}`; select.title = doc.title;
    select.setAttribute('role', 'tab'); select.setAttribute('aria-selected', String(id === activeId)); select.setAttribute('aria-controls', 'document-panel'); select.tabIndex = id === activeId ? 0 : -1;
    select.append(icon(id === 'welcome' ? 'book' : 'file'), element('span', '', doc.title));
    select.addEventListener('click', () => openDocument(id));
    select.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault(); const index = tabs.indexOf(id);
      const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      openDocument(next).then(() => $(`tab-${next}`)?.focus());
    });
    item.append(select);
    if (id !== 'welcome') {
      const close = element('button', 'icon-button tab-close'); close.type = 'button'; close.setAttribute('aria-label', `关闭 ${doc.title}`); close.append(icon('close'));
      close.addEventListener('click', async () => {
        captureEdit(); const index = tabs.indexOf(id); tabs = tabs.filter(tab => tab !== id);
        if (id === activeId) await openDocument(tabs[Math.max(0, index - 1)] || 'welcome'); else renderTabs();
      }); item.append(close);
    }
    $('tabs').append(item);
  }
  $('document-panel').setAttribute('aria-labelledby', `tab-${activeId}`);
  document.querySelector('.tab-item.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
function routeFor(id) { if (!editRoutes.has(id)) editRoutes.set(id, { id }); return editRoutes.get(id); }
function currentRaw(id) { return exportMarkdown(originals.get(id) || documents.get(id)?.raw || '', drafts.get(id)); }
function recordFor(id, body, prefix, historyReason) {
  const doc = documents.get(id);
  return { id, body, prefix: prefix ?? splitMarkdown(currentRaw(id)).prefix, document: doc, updatedAt: Date.now(), historyReason,
    historySeed: { raw: originals.get(id) || doc.raw || '', filename: doc.sourceFilename || doc.filename, at: Date.now(), reason: '修改前的原文' } };
}
function persist(record) {
  const origin = record.id;
  const route = routeFor(origin);
  drafts.set(origin, record); pendingSaves++; updateSaveStatus();
  let task;
  task = (saveQueues.get(origin) || Promise.resolve()).then(async () => {
    const id = route.id;
    const desired = drafts.get(id);
    if (!desired || desired === lastSaved.get(id)) return;
    try {
      const saved = await saveDraft(desired, revisions.get(id) || 0);
      revisions.set(id, saved.revision); lastSaved.set(id, desired); saveErrors.delete(id);
    } catch (error) {
      if (!(error instanceof DraftConflict)) throw error;
      // Preserve the newest in-memory edit, including keystrokes entered while a save was pending.
      const local = drafts.get(id);
      const copy = recoveryDocument(documents.get(id), exportMarkdown(originals.get(id), local));
      documents.set(copy.id, copy); originals.set(copy.id, copy.raw);
      const copyRecord = recordFor(copy.id, splitMarkdown(copy.raw).body, splitMarkdown(copy.raw).prefix);
      drafts.set(copy.id, copyRecord);
      revisions.set(copy.id, 0);
      // Pending saves/uploads follow this editing session to its recovery copy.
      // Reopening the original starts a separate session and must remain editable.
      route.id = copy.id; editRoutes.set(copy.id, route); editRoutes.set(id, { id });
      saveQueues.set(copy.id, task);
      drafts.set(id, error.latest); revisions.set(id, error.latest.revision || 0); lastSaved.set(id, error.latest);
      if (error.latest.document && id !== 'welcome') documents.set(id, { ...documents.get(id), ...error.latest.document });
      tabs = tabs.map(value => value === id && id !== 'welcome' ? copy.id : value);
      expanded.add(copy.categories[0]); renderLibrary();
      if (activeId === id) await openDocument(copy.id); else renderTabs();
      $('recovery-text').textContent = `另一窗口已经更新了原文章。正在将你的修改保存为“${copy.title}”。`;
      $('recovery-notice').hidden = false;
      const saved = await saveDraft(copyRecord, 0);
      revisions.set(copy.id, saved.revision); lastSaved.set(copy.id, copyRecord); saveErrors.delete(id);
      $('recovery-text').textContent = `另一窗口已经更新了原文章。你的修改已另存为“${copy.title}”，两个版本都保留。`;
    }
  }).catch(() => {
    saveErrors.add(route.id);
    if (route.id !== origin) { $('recovery-text').textContent = '另一窗口已经更新了原文章。你的修改保留在当前窗口，但本机保存失败，请先导出 Markdown 副本。'; $('recovery-notice').hidden = false; }
    toast('浏览器未能保存这次修改，请先导出 Markdown 副本。');
  }).finally(() => { pendingSaves--; updateSaveStatus(); });
  saveQueues.set(origin, task);
  return task;
}
function captureEdit() {
  if (!ready || switching || !activeId || !userEdited) return;
  const body = editor.getValue();
  if (body === currentCanonical) return;
  currentCanonical = body;
  void persist(recordFor(activeId, body));
  document.querySelectorAll('.file-row').forEach(row => { if (row.dataset.id === activeId && !row.querySelector('.local-dot')) { const dot = element('span', 'local-dot'); dot.setAttribute('aria-label', '有本机草稿'); row.append(dot); } });
  updateCount(body);
}
function updateCount(body) { $('word-count').textContent = `${body.replace(/\s/g, '').length.toLocaleString('zh-CN')} 字符`; }
async function openDocument(id) {
  if (!ready || !documents.has(id) || documents.get(id).deletedAt) return;
  captureEdit();
  const ticket = ++opening;
  const doc = documents.get(id);
  $('document-panel').setAttribute('aria-busy', 'true');
  try {
    if (!originals.has(id)) {
      const response = await fetch(doc.asset);
      if (!response.ok) throw new Error(`文章副本读取失败 (${response.status})`);
      originals.set(id, await response.text());
    }
    if (ticket !== opening) return;
    activeId = id; if (!tabs.includes(id)) tabs.push(id);
    const body = drafts.get(id)?.body ?? splitMarkdown(originals.get(id)).body;
    switching = true;
    userEdited = false;
    editor.setValue(body, true);
    currentCanonical = editor.getValue();
    switching = false;
    $('document-title').textContent = doc.title; $('document-title').title = doc.title;
    $('breadcrumb').textContent = doc.sample ? '体验示例' : `${doc.categories[0] || '未分类'} / ${doc.filename}`;
    $('breadcrumb').title = $('breadcrumb').textContent;
    const hasShortcodes = /\{\{[<%]/.test(body);
    $('notice').hidden = !hasShortcodes;
    $('notice').textContent = '这篇文章含 Hugo 短代码，建议使用分屏源码模式编辑。这里的预览不执行短代码。';
    renderTabs(); updateActiveRows(); updateCount(body); updateSaveStatus();
    if (matchMedia('(max-width: 760px)').matches) sidebarVisible(false);
    $('document-panel').setAttribute('aria-busy', 'false');
    $('save-button').disabled = false; $('export-button').disabled = false;
    $('metadata-button').disabled = !!doc.sample; $('image-button').disabled = !!doc.sample;
    for (const action of ['preview-button', 'history-button', 'trash-button']) $(action).disabled = !!doc.sample;
    $('article-menu').open = false;
  } catch (error) { switching = false; $('document-panel').setAttribute('aria-busy', 'false'); toast(error.message); }
}
function downloadCurrent() {
  captureEdit(); if (!activeId) return;
  const markdown = exportMarkdown(originals.get(activeId), drafts.get(activeId));
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const anchor = element('a'); anchor.href = url; anchor.download = documents.get(activeId).filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000); toast('Markdown 副本已导出，博客原文件没有改动。');
}
function showNewForm() {
  sidebarVisible(true); $('new-form').hidden = false;
  const categories = groupDocuments([...documents.values()]).map(group => group.name);
  if (!categories.includes('未分类')) categories.push('未分类');
  $('new-category').replaceChildren(...categories.map(category => { const option = element('option', '', category); option.value = category; return option; }));
  $('new-category').value = documents.get(activeId)?.categories[0] || '未分类';
  $('new-title').focus();
}
$('new-form').addEventListener('submit', async event => {
  event.preventDefault(); const title = $('new-title').value.trim();
  if (!title) { $('new-title').setCustomValidity('请填写文章标题'); $('new-title').reportValidity(); return; }
  captureEdit(); const doc = newDocument(title, $('new-category').value);
  try { doc.filename = uniqueFilename(doc.filename, [...documents.values()]); } catch (error) { $('new-title').setCustomValidity(error.message); $('new-title').reportValidity(); return; }
  documents.set(doc.id, doc); originals.set(doc.id, doc.raw);
  expanded.add(doc.categories[0]);
  await persist(recordFor(doc.id, splitMarkdown(doc.raw).body));
  $('new-form').hidden = true; $('new-title').value = ''; $('search').value = ''; renderLibrary(); await openDocument(doc.id);
  toast('新文章已创建在本机，可直接开始写作。');
});
$('new-title').addEventListener('input', () => $('new-title').setCustomValidity(''));
$('new-button').addEventListener('click', showNewForm);
$('cancel-new').addEventListener('click', () => { $('new-form').hidden = true; $('new-button').focus(); });
$('theme-toggle').addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));
$('sidebar-toggle').addEventListener('click', () => sidebarVisible(document.body.classList.contains('sidebar-collapsed')));
$('drawer-backdrop').addEventListener('click', () => { sidebarVisible(false); $('sidebar-toggle').focus(); });
$('search').addEventListener('input', () => { renderLibrary(); if ($('search').value) sidebarVisible(true); });
$('welcome-button').addEventListener('click', () => openDocument('welcome'));
$('welcome-link').addEventListener('click', event => { event.preventDefault(); openDocument('welcome'); });
$('save-button').addEventListener('click', () => { captureEdit(); if (saveErrors.has(activeId) && drafts.has(activeId)) void persist(drafts.get(activeId)); updateSaveStatus(); toast(saveFailed ? '正在尝试重新保存；仍失败时请导出副本。' : '修改会自动保存在当前浏览器。'); });
$('export-button').addEventListener('click', downloadCurrent);
$('github-view-pull').addEventListener('click', () => { const number = documents.get(activeId)?.github?.pullNumber; if (Number.isInteger(number)) window.open(`https://github.com/${articleRepository.repository}/pull/${number}`, '_blank', 'noopener,noreferrer'); });
$('article-menu').addEventListener('click', event => { if (event.target.closest('button')) $('article-menu').open = false; });
document.addEventListener('click', event => { if (!$('article-menu').contains(event.target)) $('article-menu').open = false; });
$('retry-button').addEventListener('click', () => location.reload());
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && CSS.supports('appearance', 'base-select') && document.querySelector('select:open')) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); event.stopPropagation(); $('save-button').click(); }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') { event.preventDefault(); event.stopPropagation(); $('search').focus(); $('search').select(); }
  if (event.key === 'Escape' && $('article-menu').open) { $('article-menu').open = false; $('article-menu').querySelector('summary').focus(); event.stopPropagation(); }
  else if (event.key === 'Escape' && !$('upload-panel').hidden) { $('close-uploads').click(); event.stopPropagation(); }
  else if (event.key === 'Escape' && !document.querySelector('dialog[open]') && matchMedia('(max-width: 760px)').matches) { sidebarVisible(false); $('sidebar-toggle').focus(); }
}, { capture: true });
for (const name of ['beforeinput', 'paste', 'cut', 'drop']) $('editor').addEventListener(name, () => { if (!switching) userEdited = true; }, { capture: true });
// Persist after the native edit event, without waiting for Vditor's render
// debounce. A quick refresh must see pending keystrokes in the save queue.
$('editor').addEventListener('input', () => { if (userEdited && !switching) queueMicrotask(captureEdit); });
$('editor').addEventListener('keydown', event => {
  if (['Backspace', 'Delete', 'Enter'].includes(event.key) || ((event.ctrlKey || event.metaKey) && ['b', 'i', 'd', 'l', 'o', 'j', 'u', 'g', 'k', 'm', 'z', 'y', ';'].includes(event.key.toLowerCase()))) userEdited = true;
}, { capture: true });
$('editor').addEventListener('pointerdown', event => {
  const type = event.target.closest('button[data-type]')?.dataset.type;
  if (['headings', 'bold', 'italic', 'strike', 'list', 'ordered-list', 'check', 'quote', 'code', 'inline-code', 'link', 'table', 'undo', 'redo'].includes(type)) userEdited = true;
}, { capture: true });
window.addEventListener('beforeunload', event => { captureEdit(); if (pendingSaves || saveFailed || imageBed.hasPending() || workspace.hasPending() || github?.hasPending()) { event.preventDefault(); event.returnValue = ''; } });
matchMedia('(max-width: 760px)').addEventListener('change', event => sidebarVisible(!event.matches));
setTheme(theme); sidebarVisible(!matchMedia('(max-width: 760px)').matches);

$('dismiss-recovery').addEventListener('click', () => { $('recovery-notice').hidden = true; });
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => $(button.dataset.closeDialog).close()));
$('metadata-button').addEventListener('click', () => {
  captureEdit(); metadataRoute = routeFor(activeId);
  const meta = readMetadata(currentRaw(activeId));
  for (const [field, value] of Object.entries({ title: meta.title, filename: documents.get(activeId).filename, date: meta.date, categories: (meta.categories || []).join(', '), tags: (meta.tags || []).join(', '), description: meta.description || '', draft: String(meta.draft === true), publish: meta.publishDate || '', expiry: meta.expiryDate || '' })) $(`meta-${field}`).value = value;
  $('meta-filename').readOnly = !!documents.get(activeId).github;
  $('filename-help').textContent = documents.get(activeId).github ? '此文章已关联仓库文件，保持原路径。需要改名时请在 GitHub 中操作，再重新读取文章。' : '以 .md 结尾，首次同步时用作 GitHub 中的文件名。';
  $('metadata-result').hidden = true; $('metadata-dialog').showModal();
});
$('metadata-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter; button.disabled = true;
  try {
    const route = metadataRoute;
    const id = route.id;
    const filename = availableFilename($('meta-filename').value, [...documents.values()], id);
    const list = field => $(`meta-${field}`).value.split(/[,，\n]/).map(value => value.trim()).filter(Boolean);
    const raw = writeMetadata(currentRaw(id), { title: $('meta-title').value, date: $('meta-date').value, categories: list('categories'), tags: list('tags'), description: $('meta-description').value, draft: $('meta-draft').value === 'true', publishDate: $('meta-publish').value, expiryDate: $('meta-expiry').value });
    const doc = { ...updatedDocument(documents.get(id), raw), filename }; documents.set(id, doc);
    doc.categories.forEach(category => expanded.add(category));
    await persist(recordFor(id, splitMarkdown(raw).body, splitMarkdown(raw).prefix, '修改属性前'));
    $('metadata-dialog').close(); renderLibrary();
    if (activeId === id || activeId === route.id) await openDocument(route.id);
    toast(saveFailed ? '属性仍在当前窗口，请导出备份。' : '文章属性已保存到本机。');
  } catch (error) { $('metadata-result').textContent = error.message; $('metadata-result').hidden = false; }
  finally { button.disabled = false; }
});

const imageBed = setupImageBed({
  getTarget() {
    if (!ready || !activeId || documents.get(activeId)?.sample) throw new Error('请先打开或新建一篇文章，再上传图片。');
    captureEdit();
    const selection = window.getSelection();
    const range = selection?.rangeCount && $('editor').contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
    return { id: activeId, route: routeFor(activeId), title: documents.get(activeId).title, range };
  },
  async insert(job, url) {
    const route = job.target.route;
    const id = route.id;
    const alt = job.file.name.replace(/\.[^.]*$/, '').replace(/[\[\]\\\r\n]/g, '-');
    const markdown = `\n![${alt}](${url})\n`;
    if (id === activeId) {
      userEdited = true;
      if (job.target.range?.startContainer.isConnected && $('editor').contains(job.target.range.startContainer)) {
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(job.target.range);
        editor.insertValue(markdown); captureEdit();
      } else {
        captureEdit(); const body = splitMarkdown(currentRaw(id)).body + markdown;
        await persist(recordFor(id, body)); await openDocument(route.id);
      }
    } else {
      const body = splitMarkdown(currentRaw(id)).body + markdown;
      await persist(recordFor(id, body)); renderLibrary();
    }
    await saveQueues.get(id);
    job.target.title = documents.get(route.id)?.title || job.target.title;
  },
  notify: toast
});

async function flushSaves() {
  captureEdit();
  while (pendingSaves) await Promise.all([...saveQueues.values()]);
}
async function loadRaw(id) {
  if (!originals.has(id)) {
    const doc = documents.get(id);
    if (!doc) throw new Error('这篇文章已不可用，请重新打开。');
    const response = await fetch(doc.asset); if (!response.ok) throw new Error(`无法读取 ${doc.filename}，请重试。`);
    originals.set(id, await response.text());
  }
  return currentRaw(id);
}
const workspace = setupWorkspace({
  localPreview: () => localPreview,
  list: () => [...documents.values()],
  active: () => activeId && !documents.get(activeId)?.sample ? { id: activeId, route: routeFor(activeId) } : null,
  flush: flushSaves,
  record: readDraft,
  async raw(id) { const route = routeFor(id); await flushSaves(); return loadRaw(route.id); },
  async change(origin, replacement, extra, reason) {
    const route = routeFor(origin); await flushSaves(); const id = route.id;
    const previous = await loadRaw(id), raw = typeof replacement === 'function' ? replacement(previous) : replacement ?? previous;
    const doc = { ...updatedDocument(documents.get(id), raw), ...extra };
    documents.set(id, doc);
    const parts = splitMarkdown(raw); await persist(recordFor(id, parts.body, parts.prefix, reason));
    renderLibrary();
    tabs = tabs.filter(tab => !documents.get(tab)?.deletedAt);
    if (documents.get(activeId)?.deletedAt) await openDocument('welcome');
    else if (activeId === id || activeId === route.id) await openDocument(route.id);
    else renderTabs();
    if (saveErrors.has(route.id)) throw new Error('本机保存失败，请先导出副本再重试。');
    if (route.id !== id) throw new Error('另一窗口已修改原文章。当前修改已另存为冲突副本，请检查两个版本后再操作。');
  },
  async backupRecords() {
    await flushSaves();
    const merged = new Map((await allDrafts()).filter(record => record.id !== 'welcome').map(record => [record.id, record]));
    for (const [id, record] of drafts) if (id !== 'welcome' && saveErrors.has(id)) merged.set(id, record);
    const result = [];
    for (const record of merged.values()) {
      let prefix = record.prefix;
      if (prefix == null) {
        const doc = record.document;
        let original = originals.get(record.id) || doc.raw;
        if (!original && doc.asset) { const response = await fetch(doc.asset); if (!response.ok) throw new Error('部分文章无法读取，请重试备份。'); original = await response.text(); }
        prefix = splitMarkdown(original || '').prefix;
      }
      result.push({ ...record, prefix });
    }
    return result;
  },
  async importCopies(items) {
    await flushSaves(); const names = [...documents.values()];
    const records = items.map(({ document: source, history }) => {
      const doc = { ...source, filename: uniqueFilename(source.filename, names) }; names.push(doc);
      const { prefix, body } = splitMarkdown(doc.raw);
      return { id: doc.id, document: doc, body, prefix, history, updatedAt: Date.now(), revision: 1 };
    });
    await importDrafts(records);
    for (const record of records) {
      const doc = record.document; documents.set(doc.id, doc); originals.set(doc.id, doc.raw); drafts.set(doc.id, record); revisions.set(doc.id, 1); lastSaved.set(doc.id, record); doc.categories.forEach(category => expanded.add(category));
    }
    $('search').value = ''; renderLibrary();
    const first = records.find(record => !record.document.deletedAt); if (first) await openDocument(first.id);
  },
  notify: toast
});

github = setupGitHub({
  active: () => ready && activeId && !documents.get(activeId)?.sample && !documents.get(activeId)?.deletedAt,
  list: () => [...documents.values()],
  async merge(remoteDocuments) {
    await flushSaves();
    const byPath = new Map([...documents.values()].filter(doc => doc.github || (!doc.local && !doc.sample)).map(doc => [doc.github?.path || articlePath(doc.sourceFilename || doc.filename), doc]));
    const seen = new Set(), cache = [], tasks = []; let kept = 0;
    for (const remote of remoteDocuments) {
      const previous = byPath.get(remote.github.path), id = previous?.id || remote.id;
      const incoming = { ...remote, id, github: { ...remote.github, verified: true } };
      seen.add(id); cache.push({ id, document: incoming, raw: remote.raw });
      if (previous && hasLocalChanges(previous)) {
        kept++;
        documents.set(id, { ...previous, remoteMissing: false, remoteChanged: previous.github?.sha !== remote.github.sha });
        if (drafts.has(id)) { const parts = splitMarkdown(currentRaw(id)); tasks.push(persist(recordFor(id, parts.body, parts.prefix))); }
      } else {
        documents.set(id, incoming); originals.set(id, remote.raw);
        if (drafts.has(id)) { const parts = splitMarkdown(remote.raw); tasks.push(persist(recordFor(id, parts.body, parts.prefix, '读取 GitHub 前'))); }
      }
    }
    for (const previous of byPath.values()) if (!seen.has(previous.id)) {
      const doc = { ...previous, remoteMissing: true }; documents.set(doc.id, doc);
      cache.push({ id: doc.id, document: doc, raw: originals.get(doc.id) || doc.raw || doc.github?.baseRaw || '' });
      if (drafts.has(doc.id)) { const parts = splitMarkdown(currentRaw(doc.id)); tasks.push(persist(recordFor(doc.id, parts.body, parts.prefix))); }
    }
    renderLibrary(); if (activeId) await openDocument(activeId);
    await Promise.all(tasks); await cacheSources(cache); updateSaveStatus();
    return kept;
  },
  async snapshot() {
    const route = routeFor(activeId); await flushSaves(); const id = route.id;
    if (saveFailed || imageBed.hasPending()) throw new Error('请等本机保存和图片上传完成后再同步。');
    const previous = await loadRaw(id), raw = prepareArticle(previous);
    if (raw !== previous) { const parts = splitMarkdown(raw); await persist(recordFor(id, parts.body, parts.prefix, '同步前整理属性')); }
    if (route.id !== id || saveErrors.has(id)) throw new Error('本机版本发生变化，请检查草稿后重新同步。');
    const doc = documents.get(id);
    if (doc.deletedAt) throw new Error('请先从回收站恢复文章。');
    const path = doc.github?.path || articlePath(doc.filename);
    return { id, route, title: doc.title, document: { ...doc }, path, raw, baseSha: doc.github?.sha || null };
  },
  async check(job) {
    await flushSaves();
    const latest = await readDraft(job.id);
    if (job.route.id !== job.id || (latest?.revision || 0) !== (revisions.get(job.id) || 0) || currentRaw(job.id) !== job.raw || documents.get(job.id)?.deletedAt || imageBed.hasPending()) throw new Error('文章或图片状态已改变，请关闭此窗口，检查本机草稿后重新同步。');
  },
  async saved(job, result) {
    const ref = { ...articleRepository, branch: result.branch || 'main', pullNumber: result.pullNumber, pullURL: result.pullURL, path: result.path, sha: result.sha, baseRaw: result.raw, verified: true };
    const cached = { ...job.document, github: ref, raw: result.raw, remoteChanged: false, remoteMissing: false };
    await cacheSources([{ id: job.id, document: cached, raw: result.raw }]);
    await flushSaves();
    if (job.route.id !== job.id) { updateSaveStatus(); return; }
    captureEdit();
    const current = documents.get(job.id), raw = currentRaw(job.id);
    documents.set(job.id, { ...current, github: ref, sourceFilename: result.path.split('/').at(-1), remoteChanged: false, remoteMissing: false });
    const parts = splitMarkdown(raw); await persist(recordFor(job.id, parts.body, parts.prefix));
    renderLibrary(); updateSaveStatus();
    if (saveErrors.has(job.route.id)) throw new Error('GitHub 提交成功，但本机同步记录未保存，请先导出副本。再次同步会核对已提交内容。');
  },
  async resolve(job, remote) {
    await flushSaves(); const id = job.route.id;
    const original = documents.get(id), raw = await loadRaw(id);
    const copy = recoveryDocument(original, raw); copy.filename = uniqueFilename(copy.filename, [...documents.values()]);
    documents.set(copy.id, copy); originals.set(copy.id, copy.raw);
    let parts = splitMarkdown(copy.raw); await persist(recordFor(copy.id, parts.body, parts.prefix, '保留 GitHub 冲突副本'));
    if (saveErrors.has(copy.id)) throw new Error('副本保存失败，原文章尚未替换，请先导出 Markdown。');
    if (id !== job.id) { renderLibrary(); await openDocument(copy.id); return; }
    if (remote) {
      const doc = updatedDocument({ ...original, raw: remote.raw, github: { ...articleRepository, branch: remote.branch || 'main', pullNumber: remote.pullNumber, pullURL: remote.pullURL, path: job.path, sha: remote.sha, baseRaw: remote.raw, verified: true }, remoteChanged: false, remoteMissing: false }, remote.raw);
      documents.set(id, doc); originals.set(id, remote.raw);
      parts = splitMarkdown(remote.raw); await persist(recordFor(id, parts.body, parts.prefix, '接受 GitHub 版本前'));
      await cacheSources([{ id, document: doc, raw: remote.raw }]);
    } else {
      documents.set(id, { ...original, deletedAt: Date.now(), remoteMissing: true });
      parts = splitMarkdown(raw); await persist(recordFor(id, parts.body, parts.prefix, '远端已删除，保留本机记录'));
      tabs = tabs.filter(tab => tab !== id);
    }
    expanded.add(copy.categories[0]); renderLibrary(); await openDocument(copy.id);
  },
  notify: toast
});

async function boot() {
  const response = await fetch('data/index.json');
  if (!response.ok) throw new Error('文章目录读取失败，请重新加载。');
  const data = await response.json(); localPreview = data.localPreview === true;
  data.documents.forEach(doc => documents.set(doc.id, { ...doc, sourceFilename: doc.filename }));
  if (!localPreview) { $('preview-button').title = 'Markdown 预览'; $('preview-button').setAttribute('aria-label', 'Markdown 预览'); }
  try {
    for (const source of await allSources()) { documents.set(source.id, source.document); originals.set(source.id, source.raw); }
    for (const draft of await allDrafts()) {
      if (draft.document && !documents.has(draft.id)) { documents.set(draft.id, draft.document); originals.set(draft.id, exportMarkdown(draft.document.raw || '', draft)); }
      if (documents.has(draft.id)) {
        drafts.set(draft.id, draft); revisions.set(draft.id, draft.revision || 0); lastSaved.set(draft.id, draft);
        if (draft.document && draft.id !== 'welcome') documents.set(draft.id, { ...documents.get(draft.id), ...draft.document });
      }
    }
  } catch (error) { saveErrors.add('database'); toast(error.message || '浏览器本机存储不可用，编辑后请导出副本。', { kind: 'error', duration: 0 }); }
  const groups = groupDocuments([...documents.values()]);
  // Start with a compact, real category rather than hundreds of expanded rows.
  const initial = groups.find(group => group.documents.length >= 3 && group.documents.length <= 12) || groups[0];
  if (initial) expanded.add(initial.name);
  renderLibrary();
  if (typeof Vditor !== 'function') throw new Error('Vditor 资源未加载，请确认本地服务仍在运行后重试。');
  editor = new Vditor('editor', {
    cdn: vendor, lang: 'zh_CN', mode: 'ir', height: '100%', minHeight: 120,
    theme: theme === 'dark' ? 'dark' : 'classic', cache: { enable: false }, value: '',
    placeholder: '从这里开始写作…',
    toolbar: ['headings', 'bold', 'italic', 'strike', '|', 'list', 'ordered-list', 'check', 'quote', '|', 'code', 'inline-code', 'link', 'table', '|', 'undo', 'redo', '|', 'edit-mode', { name: 'both', tip: '编辑与预览', hotkey: '' }, 'preview', 'outline'],
    toolbarConfig: { pin: true }, outline: { enable: true, position: 'right' },
    preview: { delay: 180, actions: [], theme: { current: theme === 'dark' ? 'dark' : 'light', path: `${vendor}/dist/css/content-theme` },
      hljs: { enable: true, style: theme === 'dark' ? 'github-dark' : 'github', lineNumber: false }, markdown: { sanitize: true, autoSpace: false, fixTermTypo: false }, math: { engine: 'KaTeX' } },
    hint: { emojiPath: `${vendor}/dist/images/emoji` },
    upload: { handler: files => { imageBed.enqueue(files); return null; } },
    input: () => captureEdit(),
    after: () => { ready = true; document.body.dataset.ready = 'true'; $('manage-button').disabled = false; $('import-button').disabled = false; openDocument('welcome'); },
    blur: () => captureEdit()
  });
}
boot().catch(error => { $('load-error').hidden = false; $('load-error-text').textContent = error.message; $('save-status').textContent = '未能载入工作区'; console.error(error); });
