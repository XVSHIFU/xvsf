(() => {
  const entry = document.getElementById('terminal-entry');
  if (!entry) return;
  let terminal;
  let pending = false;
  let retry = 0;
  const root = document.documentElement;
  root.dataset.terminalInput = 'pointer';
  window.addEventListener('pointerdown', () => { root.dataset.terminalInput = 'pointer'; }, true);
  window.addEventListener('keydown', event => { if (event.key === 'Tab') root.dataset.terminalInput = 'keyboard'; }, true);
  entry.addEventListener('click', async () => {
    if (pending) return;
    if (terminal) { terminal.open(); return; }
    pending = true;
    entry.setAttribute('aria-busy', 'true');
    try {
      const url = new URL(entry.dataset.module, location.href);
      if (retry) url.searchParams.set('terminal-retry', String(retry));
      const module = await import(url.href);
      terminal = await module.mountTerminal(entry, { ...entry.dataset });
      terminal.open();
      entry.title = 'Terminal';
      document.getElementById('terminal-status').textContent = '';
    } catch (error) {
      retry += 1;
      entry.title = 'Terminal unavailable. Click to retry.';
      document.getElementById('terminal-status').textContent = entry.title;
      console.error('[terminal] load failed', error);
    } finally {
      pending = false;
      entry.removeAttribute('aria-busy');
    }
  });
})();
