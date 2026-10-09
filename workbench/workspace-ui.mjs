import { importedDocument, parseBackup, createBackup, MAX_DOCUMENT_BYTES } from './workspace-model.mjs';
import { writeMetadata, splitMarkdown } from './model.mjs';

export function setupWorkspace(context) {
  const $ = id => document.getElementById(id);
  const node = (tag, text, className) => { const item = document.createElement(tag); if (text !== undefined) item.textContent = text; if (className) item.className = className; return item; };
  const message = (id, text) => { $(id).textContent = text; $(id).hidden = !text; };
  let trash = false, selected = new Set(), pendingImports = [], historyRoute, history = [], previewRoute, previewTicket = 0, busy = 0;
  const formatTime = timestamp => new Date(timestamp).toLocaleString('zh-CN', { hour12: false });
  async function action(button, result, callback) {
    button.disabled = true; busy++; message(result, '');
    try { await callback(); } catch (error) { message(result, error.message || '操作失败，内容仍保留，请重试。'); }
    finally { button.disabled = false; busy--; if ($('manager-dialog').open) updateSelection(); }
  }
  function updateSelection() {
    $('manager-count').textContent = `已选 ${selected.size} 篇`;
    for (const id of ['trash-selected', 'restore-selected', 'move-selected']) $(id).disabled = !selected.size || busy > 0;
    const boxes = [...$('manager-list').querySelectorAll('input[type=checkbox]')];
    $('manager-select-all').checked = !!boxes.length && boxes.every(box => box.checked);
    $('manager-select-all').indeterminate = boxes.some(box => box.checked) && !boxes.every(box => box.checked);
  }
  function renderManager() {
    const query = $('manager-search').value.trim().toLocaleLowerCase();
    const docs = context.list().filter(doc => !doc.sample && !!doc.deletedAt === trash && [doc.title, doc.filename, ...doc.categories].join(' ').toLocaleLowerCase().includes(query));
    selected.clear(); $('manager-list').replaceChildren();
    $('manager-active').setAttribute('aria-pressed', String(!trash)); $('manager-trash').setAttribute('aria-pressed', String(trash));
    $('manager-move').hidden = trash; $('trash-selected').hidden = trash; $('restore-selected').hidden = !trash;
    for (const doc of docs) {
      const row = node('div', undefined, 'manager-row'); const box = node('input'); box.type = 'checkbox'; box.id = `manage-${doc.id}`; box.dataset.id = doc.id;
      const label = node('label'); label.htmlFor = box.id;
      label.append(node('strong', doc.title), node('small', `${doc.filename} · ${trash ? `移入于 ${formatTime(doc.deletedAt)}` : doc.categories.join(' / ') || '未分类'}`));
      box.addEventListener('change', () => { if (box.checked) selected.add(doc.id); else selected.delete(doc.id); updateSelection(); });
      row.append(box, label); $('manager-list').append(row);
    }
    if (!docs.length) $('manager-list').append(node('p', trash ? '回收站为空。移入这里的文章可以随时恢复。' : '没有找到文章，换个关键词试试。', 'sidebar-message'));
    const categories = [...new Set(context.list().filter(doc => !doc.deletedAt).flatMap(doc => doc.categories))].sort();
    $('known-categories').replaceChildren(...categories.map(category => { const option = node('option'); option.value = category; return option; }));
    updateSelection();
  }
  $('manage-button').addEventListener('click', async () => { await context.flush(); renderManager(); message('manager-result', ''); $('manager-dialog').showModal(); });
  for (const [id, value] of [['manager-active', false], ['manager-trash', true]]) $(id).addEventListener('click', () => { trash = value; message('manager-result', ''); renderManager(); });
  $('manager-search').addEventListener('input', renderManager);
  $('manager-select-all').addEventListener('change', event => { selected.clear(); for (const box of $('manager-list').querySelectorAll('input[type=checkbox]')) { box.checked = event.target.checked; if (box.checked) selected.add(box.dataset.id); } updateSelection(); });
  async function batch(button, operation) {
    const ids = [...selected]; let completed = 0;
    await action(button, 'manager-result', async () => {
      try { for (const id of ids) { await operation(id); completed++; } }
      catch (error) { throw new Error(`已处理 ${completed} 篇；其余未完成：${error.message}`); }
      finally { renderManager(); }
      message('manager-result', `已处理 ${completed} 篇，修改保存在本机。`);
    });
  }
  $('trash-selected').addEventListener('click', event => batch(event.currentTarget, id => context.change(id, null, { deletedAt: Date.now() }, '移入回收站前')));
  $('restore-selected').addEventListener('click', event => batch(event.currentTarget, id => context.change(id, null, { deletedAt: null }, '恢复回收站文章前')));
  $('move-selected').addEventListener('click', event => {
    const category = $('batch-category').value.trim();
    if (!category || category.length > 100) { message('manager-result', '请填写 1–100 字的分类名称。'); $('batch-category').focus(); return; }
    return batch(event.currentTarget, id => context.change(id, raw => writeMetadata(raw, { categories: [category] }), {}, '移动分类前'));
  });
  $('trash-button').addEventListener('click', async () => {
    $('article-menu').open = false;
    const target = context.active();
    if (!target) return;
    try { await context.change(target.id, null, { deletedAt: Date.now() }, '移入回收站前'); context.notify('已移入本机回收站，可在「文章管理」中恢复。'); }
    catch (error) { context.notify(error.message); }
  });
  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
    const anchor = node('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
  $('backup-button').addEventListener('click', event => action(event.currentTarget, 'manager-result', async () => {
    const records = await context.backupRecords();
    if (!records.length) throw new Error('还没有需要备份的本机草稿。编辑或导入文章后再备份。');
    download(`xvsf-drafts-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, createBackup(records));
    message('manager-result', `已导出 ${records.length} 篇草稿及历史、回收站。未修改的原文章和图床令牌不包含在备份中。`);
  }));
  $('import-button').addEventListener('click', () => $('markdown-files').click());
  $('restore-backup-button').addEventListener('click', () => $('backup-file').click());
  function showImports(items) {
    pendingImports = items;
    if (!items.length) throw new Error('文件中没有可导入的文章。');
    $('manager-dialog').close();
    $('import-summary').textContent = `共 ${items.length} 篇。将创建新副本，同名文件自动加序号，已有文章保持不变。`;
    $('import-list').replaceChildren(...items.map(item => node('li', `${item.document.filename}${item.document.deletedAt ? '（回收站）' : ''}`)));
    message('import-result', ''); $('import-dialog').showModal();
  }
  $('markdown-files').addEventListener('change', async event => {
    const files = [...event.target.files]; event.target.value = ''; if (!files.length) return;
    try {
      if (files.length > 100) throw new Error('单次最多导入 100 篇 Markdown。');
      const names = context.list(), items = [];
      for (const file of files) {
        if (file.size > MAX_DOCUMENT_BYTES) throw new Error(`${file.name} 超过 2 MB，请缩小后再导入。`);
        const raw = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer());
        const doc = importedDocument(file.name, raw, names); names.push(doc); items.push({ document: doc, history: [] });
      }
      showImports(items);
    } catch (error) { context.notify(error.message); }
  });
  $('backup-file').addEventListener('change', async event => {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    try { if (file.size > 50 * 1024 * 1024) throw new Error('备份不能超过 50 MB。'); showImports(parseBackup(await file.text(), context.list())); }
    catch (error) { message('manager-result', error.message); }
  });
  $('confirm-import').addEventListener('click', event => action(event.currentTarget, 'import-result', async () => {
    await context.importCopies(pendingImports); const count = pendingImports.length; pendingImports = []; $('import-dialog').close(); context.notify(`已导入 ${count} 篇新副本。`);
  }));
  $('import-dialog').addEventListener('close', () => { pendingImports = []; });

  $('history-button').addEventListener('click', async () => {
    $('article-menu').open = false; const target = context.active(); if (!target) return; historyRoute = target.route;
    try {
      await context.flush(); history = [...((await context.record(historyRoute.id))?.history || [])].reverse();
      $('history-versions').replaceChildren(...history.map((entry, index) => { const option = node('option', `${formatTime(entry.at)} · ${entry.reason}`); option.value = index; return option; }));
      $('history-empty').hidden = !!history.length; $('history-versions').disabled = !history.length; $('restore-version').disabled = !history.length;
      $('history-content').value = history[0]?.raw || ''; message('history-result', ''); $('history-dialog').showModal();
    } catch (error) { context.notify(error.message); }
  });
  $('history-versions').addEventListener('change', () => { $('history-content').value = history[Number($('history-versions').value)]?.raw || ''; });
  $('restore-version').addEventListener('click', event => action(event.currentTarget, 'history-result', async () => {
    const entry = history[Number($('history-versions').value)]; if (!entry) return;
    await context.change(historyRoute.id, entry.raw, {}, '恢复历史版本前'); $('history-dialog').close(); context.notify('已恢复正文与属性，恢复前的版本也已留存。');
  }));
  async function buildPreview() {
    const ticket = ++previewTicket, target = previewRoute;
    busy++; $('rebuild-preview').disabled = true; message('preview-error', '');
    try {
      $('preview-state').textContent = '正在使用 Hugo 生成当前草稿…'; $('preview-frame').hidden = true; $('open-preview').hidden = true;
      const raw = await context.raw(target.id);
      if (!context.localPreview()) {
        const vendor = new URL('vendor/vditor', location.href).href.replace(/\/$/, '');
        const html = await Vditor.md2html(splitMarkdown(raw).body, { cdn: vendor, mode: 'dark', markdown: { sanitize: true, autoSpace: false, fixTermTypo: false } });
        if (ticket !== previewTicket) return;
        const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
        $('preview-frame').setAttribute('sandbox', '');
        $('preview-frame').removeAttribute('src');
        $('preview-frame').srcdoc = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: http: data:; style-src 'unsafe-inline' https: http:; font-src https: http: data:"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${vendor}/dist/index.css"><link rel="stylesheet" href="${vendor}/dist/css/content-theme/${theme}.css"><style>body{margin:0;padding:28px 24px;background:${theme === 'dark' ? '#1e2024' : '#fff'}}article{max-width:850px;margin:auto;overflow-wrap:anywhere}</style></head><body><article class="vditor-reset">${html}</article></body></html>`;
        $('preview-frame').hidden = false;
        $('preview-state').textContent = 'Markdown 预览 · Hugo 短代码与博客主题效果需在本地预览';
        $('preview-title').textContent = 'Markdown 预览';
        document.querySelector('.preview-footnote').textContent = '展示当前正文，不提交到 GitHub。博客实际效果由 Hugo 构建决定。';
        return;
      }
      $('preview-frame').setAttribute('sandbox', 'allow-scripts allow-same-origin');
      $('preview-frame').removeAttribute('srcdoc');
      const session = await fetch('/api/preview-session').then(response => { if (!response.ok) throw new Error('预览服务不可用，请重启本地服务。'); return response.json(); });
      const response = await fetch('/api/preview', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Workbench-Token': session.token }, body: JSON.stringify({ raw }), signal: AbortSignal.timeout(90_000) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || '预览生成失败，请重试。');
      const url = new URL(result.url); if (url.hostname !== '127.0.0.1' || url.protocol !== 'http:' || url.origin === location.origin) throw new Error('预览地址无效，请重启本地服务。');
      if (ticket !== previewTicket) return;
      $('preview-frame').src = url.href; $('preview-frame').hidden = false; $('open-preview').href = url.href; $('open-preview').hidden = false;
      $('preview-state').textContent = `已生成 · ${formatTime(result.builtAt)} · 修改后可重新生成`;
    } catch (error) {
      if (ticket === previewTicket) { message('preview-error', error.message || '预览生成失败，请重试。'); $('preview-state').textContent = '生成失败，草稿仍保存在工作区。'; }
    } finally { busy--; if (ticket === previewTicket) $('rebuild-preview').disabled = false; }
  }
  $('preview-button').addEventListener('click', () => { const target = context.active(); if (!target) return; previewRoute = target.route; $('preview-dialog').showModal(); void buildPreview(); });
  $('rebuild-preview').addEventListener('click', buildPreview);
  $('preview-dialog').addEventListener('close', () => { previewTicket++; $('preview-frame').hidden = true; $('preview-frame').removeAttribute('src'); $('preview-frame').removeAttribute('srcdoc'); $('rebuild-preview').disabled = false; });
  return { hasPending: () => busy > 0 };
}
