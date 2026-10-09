import { defaultImageBed, normalizeImageBed, checkImageBed, prepareImage, uploadImage } from './image-bed.mjs';

export function setupImageBed({ getTarget, insert, notify }) {
  const $ = id => document.getElementById(id);
  const make = (tag, className, text) => { const node = document.createElement(tag); node.className = className; if (text !== undefined) node.textContent = text; return node; };
  let settings = { ...defaultImageBed }, token = '', running = false;
  const jobs = [];
  try { const saved = JSON.parse(localStorage.getItem('xvsf-image-bed-settings')); if (saved) settings = normalizeImageBed(saved); } catch {}

  function result(message) { $('image-settings-result').textContent = message; $('image-settings-result').hidden = false; }
  function formSettings() { return normalizeImageBed({ repository: $('image-repository').value, branch: $('image-branch').value, folder: $('image-folder').value, linkStyle: $('image-link-style').value }); }
  function showSettings() {
    for (const [id, value] of [['repository', settings.repository], ['branch', settings.branch], ['folder', settings.folder], ['link-style', settings.linkStyle]]) $(`image-${id}`).value = value;
    $('image-token').value = '';
    $('image-token').placeholder = token ? '当前页面已配置；留空继续使用' : '粘贴仅授权图床仓库的令牌';
    $('image-settings-result').hidden = true;
    document.querySelector('#image-settings-form button[type="submit"]').textContent = jobs.some(job => job.state === 'queued') ? '保存并继续上传' : '保存设置';
    if (!$('image-settings').open) $('image-settings').showModal();
  }
  $('image-settings-button').addEventListener('click', showSettings);
  $('image-settings').addEventListener('close', () => { $('image-token').value = ''; });
  $('forget-image-token').addEventListener('click', () => { token = ''; $('image-token').value = ''; $('image-token').placeholder = '粘贴仅授权图床仓库的令牌'; $('image-connection').classList.remove('connected'); result('已清除当前页面的令牌。'); });
  $('test-image-connection').addEventListener('click', async () => {
    const button = $('test-image-connection'); button.disabled = true;
    result('正在检查仓库和分支…');
    try { await checkImageBed(formSettings(), $('image-token').value.trim() || token); result('连接成功，仓库与分支可访问。本次检查未上传图片，写入权限将在上传时验证。'); }
    catch (error) { result(error.message); }
    finally { button.disabled = false; }
  });
  $('image-settings-form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      settings = formSettings();
      const candidate = $('image-token').value.trim();
      if (candidate) token = candidate;
      try { localStorage.setItem('xvsf-image-bed-settings', JSON.stringify(settings)); } catch { notify('当前浏览器不能记住图床设置，本次页面仍可使用。'); }
      $('image-connection').classList.toggle('connected', !!token);
      $('image-token').value = '';
      $('image-settings').close();
      notify(token ? '图床设置已保存，令牌仅用于当前页面。' : '图床设置已保存，上传前还需填写令牌。');
      if (token) void runQueue();
    } catch (error) { result(error.message); }
  });

  function showUploads(visible, focus = false) {
    $('upload-panel').hidden = !visible;
    $('uploads-toggle').setAttribute('aria-expanded', String(visible));
    if (focus) (visible ? $('close-uploads') : $('uploads-toggle')).focus();
  }
  function retry(job) {
    if (!jobs.includes(job) || job.state !== 'failed') return;
    job.state = 'queued'; job.error = ''; render();
    if (token) void runQueue(); else showSettings();
  }
  function render() {
    $('upload-list').replaceChildren();
    $('uploads-toggle').hidden = jobs.length === 0;
    const waiting = jobs.filter(job => job.state === 'queued' || job.state === 'uploading').length;
    const failed = jobs.filter(job => job.state === 'failed').length;
    $('uploads-toggle').textContent = waiting ? `图片 · ${waiting} 张处理中${failed ? ` · ${failed} 张失败` : ''}` : failed ? `图片 · ${failed} 张失败` : `图片记录 · ${jobs.length}`;
    $('uploads-toggle').dataset.state = failed ? 'failed' : waiting ? 'pending' : 'done';
    for (const job of jobs) {
      const row = make('div', 'upload-row'); row.dataset.state = job.state;
      const info = make('div', 'upload-info');
      const name = make('span', 'upload-name', job.file.name); name.title = job.file.name;
      const detail = job.state === 'queued' ? token ? '等待上传' : '等待配置图床令牌' : job.state === 'uploading' ? '正在上传到 GitHub…' : job.state === 'done' ? '已上传并插入原文章' : job.error;
      info.append(name, make('span', 'upload-detail', `${job.target.title} · ${detail}`));
      const actions = make('div', 'upload-actions');
      if (job.state === 'failed' || (job.state === 'queued' && !token)) {
        const retry = make('button', 'text-button', job.state === 'failed' ? '重试' : '配置图床'); retry.type = 'button';
        retry.addEventListener('click', () => { job.state = 'queued'; job.error = ''; render(); if (token) void runQueue(); else showSettings(); }); actions.append(retry);
      }
      if (job.url) { const link = make('a', 'text-button', '查看图片'); link.href = job.url; link.target = '_blank'; link.rel = 'noreferrer'; actions.append(link); }
      if (job.state !== 'uploading') {
        const remove = make('button', 'text-button', '移出列表'); remove.type = 'button'; remove.addEventListener('click', () => { jobs.splice(jobs.indexOf(job), 1); render(); if (!jobs.length) showUploads(false); }); actions.append(remove);
      }
      row.append(info, actions); $('upload-list').append(row);
    }
  }

  async function runQueue() {
    if (running || !token) return;
    running = true;
    const completed = [], failed = [];
    try {
      while (token) {
        const job = jobs.find(item => item.state === 'queued'); if (!job) break;
        job.state = 'uploading'; render();
        try {
          // Reuse the same path on retries: a completed PUT with a lost response is detected by its blob SHA.
          job.plan ??= await prepareImage(job.file, settings);
          job.url ??= await uploadImage(job.plan, token);
          if (!job.inserted) { await insert(job, job.url); job.inserted = true; }
          job.state = 'done'; completed.push(job);
        } catch (error) { job.state = 'failed'; job.error = error.message; failed.push(job); }
        render();
      }
    } finally { running = false; }
    if (failed.length) {
      const single = failed.length === 1 && !completed.length;
      const message = single
        ? `${failed[0].url ? '图片已上传，插入文章失败' : '图片上传失败'}：${failed[0].error}`
        : `${completed.length ? `${completed.length} 张图片已上传并插入，` : ''}${failed.length} 张未完成。`;
      notify(message, { kind: 'error', duration: 0, action: single ? { label: '重试', run: () => retry(failed[0]) } : { label: '查看', run: () => showUploads(true, true) } });
    } else if (completed.length) {
      notify(completed.length === 1 ? `图片已上传并插入「${completed[0].target.title}」` : `${completed.length} 张图片已上传并插入各自文章`, { kind: 'success', duration: 4200 });
    }
  }

  function enqueue(files) {
    try {
      const target = getTarget();
      const selected = [...files];
      if (!selected.length) return;
      for (const file of selected) jobs.push({ file, target, state: 'queued' });
      render();
      if (token) void runQueue(); else showSettings();
    } catch (error) { notify(error.message); }
  }
  $('image-button').addEventListener('click', () => $('image-files').click());
  $('image-files').addEventListener('change', () => { enqueue($('image-files').files); $('image-files').value = ''; });
  $('uploads-toggle').addEventListener('click', () => showUploads($('upload-panel').hidden, true));
  $('close-uploads').addEventListener('click', () => showUploads(false, true));
  document.addEventListener('click', event => { if (!['upload-panel', 'uploads-toggle', 'toast'].some(id => event.composedPath().includes($(id)))) showUploads(false); });
  $('editor').addEventListener('paste', event => {
    const files = [...(event.clipboardData?.files || [])];
    if (files.length) { event.preventDefault(); event.stopImmediatePropagation(); enqueue(files); }
  }, { capture: true });
  $('editor').addEventListener('dragover', event => { if ([...(event.dataTransfer?.types || [])].includes('Files')) event.preventDefault(); }, { capture: true });
  $('editor').addEventListener('drop', event => {
    const files = [...(event.dataTransfer?.files || [])];
    if (files.length) { event.preventDefault(); event.stopImmediatePropagation(); enqueue(files); }
  }, { capture: true });
  return { enqueue, hasPending: () => jobs.some(job => job.state !== 'done') };
}
