import { articleRepository, listArticles, saveArticle, RemoteConflict, publicationLabel } from './github.mjs';

const $ = id => document.getElementById(id);
const message = (id, text) => { $(id).textContent = text; $(id).hidden = !text; };

export function setupGitHub(context) {
  let token = '', busy = false, connected = false, pending, conflict, resolving = false;
  $('github-conflict-dialog').addEventListener('cancel', event => { if (resolving) event.preventDefault(); });
  function update() {
    $('github-connection').dataset.connected = String(connected);
    $('github-settings-button').setAttribute('aria-label', connected ? 'GitHub 文章设置，已连接' : 'GitHub 文章设置');
    $('github-connect').disabled = busy;
    $('github-forget').disabled = busy || !token;
    $('github-submit').disabled = busy || !pending;
    $('sync-button').disabled = busy || !context.active();
    $('github-token').disabled = busy;
  }
  function settings() {
    message('github-settings-result', connected ? '已连接。可再次读取最新文章，本机未同步的修改会保留。' : '');
    $('github-token').placeholder = token ? '当前页面已配置，留空继续使用' : '粘贴授权 xvsf 仓库的令牌';
    $('github-settings').showModal();
  }
  $('github-settings-button').addEventListener('click', settings);
  $('github-settings').addEventListener('close', () => { $('github-token').value = ''; });
  $('github-forget').addEventListener('click', () => {
    token = ''; connected = false; $('github-token').value = ''; update();
    message('github-settings-result', '当前页面令牌已清除，本机草稿和已读取的文章仍保留。');
  });
  $('github-settings-form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    const supplied = $('github-token').value.trim();
    if (!supplied && !token) { message('github-settings-result', '请填写授权 xvsf 仓库的文章令牌。'); $('github-token').focus(); return; }
    token = supplied || token; $('github-token').value = '';
    busy = true; connected = false; update(); message('github-settings-result', '正在读取 GitHub 文章目录…');
    try {
      const docs = await listArticles(token, context.list(), (done, total) => message('github-settings-result', `正在读取文章 ${done} / ${total}…`));
      const kept = await context.merge(docs);
      connected = true;
      message('github-settings-result', `已读取 ${docs.length} 篇文章${kept ? `，保留 ${kept} 篇本机修改` : ''}。连接检查只读取仓库，写权限会在提交时验证。`);
      context.notify('GitHub 文章已读取，本机草稿已保留。', { kind: 'success' });
    } catch (error) { message('github-settings-result', error.message); }
    finally { busy = false; update(); }
  });
  $('sync-button').addEventListener('click', async () => {
    if (busy || !context.active()) return;
    if (!token || !connected) { settings(); return; }
    busy = true; update();
    try {
      pending = await context.snapshot();
      $('github-submit-title').textContent = `同步「${pending.title}」`;
      $('github-submit-path').textContent = `${articleRepository.repository} · 通过 PR 合并到 ${articleRepository.branch}\n${pending.path}`;
      $('github-publication').textContent = publicationLabel(pending.raw);
      message('github-submit-result', ''); $('github-submit-dialog').showModal();
    } catch (error) { context.notify(error.message, { kind: 'error', duration: 0 }); }
    finally { busy = false; update(); }
  });
  $('github-submit').addEventListener('click', async () => {
    if (busy || !pending) return;
    const job = pending; busy = true; update(); message('github-submit-result', '正在核对 GitHub 版本并提交…');
    try {
      await context.check(job);
      const result = await saveArticle(job, token);
      await context.saved(job, result);
      $('github-submit-dialog').close(); pending = null;
      context.notify(result.pullNumber ? `已保存到 GitHub，PR #${result.pullNumber} 待检查与合并。` : 'GitHub 主分支已有相同内容，无需重复提交。', { kind: 'success', duration: 6000,
        ...(result.pullNumber ? { action: { label: '查看并合并', run: () => window.open(result.pullURL, '_blank', 'noopener,noreferrer') } } : {}) });
    } catch (error) {
      if (error instanceof RemoteConflict) {
        conflict = { job, remote: error.remote };
        $('github-submit-dialog').close();
        $('github-conflict-local').value = job.raw;
        $('github-conflict-remote').value = error.remote?.raw || '远端文件已被删除。';
        message('github-conflict-result', error.message);
        $('github-conflict-dialog').showModal();
      } else {
        message('github-submit-result', error.message);
        if (!$('github-submit-dialog').open) context.notify(error.message, { kind: 'error', duration: 0 });
      }
    } finally { busy = false; update(); }
  });
  $('github-keep-copy').addEventListener('click', async () => {
    if (busy || !conflict) return;
    busy = true; resolving = true; update();
    $('github-conflict-dialog').querySelectorAll('button').forEach(button => { button.disabled = true; });
    try {
      await context.resolve(conflict.job, conflict.remote);
      const removed = !conflict.remote;
      $('github-conflict-dialog').close(); conflict = null;
      context.notify(removed ? '本机修改已另存为新草稿，已删除的原文章记录保留在本机回收站。' : '本机修改已另存为草稿副本，原文章已更新为 GitHub 版本。', { kind: 'success' });
    } catch (error) { message('github-conflict-result', error.message); }
    finally { busy = false; resolving = false; $('github-conflict-dialog').querySelectorAll('button').forEach(button => { button.disabled = false; }); update(); }
  });
  update();
  return { update, hasPending: () => busy };
}
