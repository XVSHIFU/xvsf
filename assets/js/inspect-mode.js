(() => {
  const root = document.documentElement;
  const button = document.getElementById('inspect-toggle');
  if (!button) return;

  const storageKey = 'xvsf-inspect-mode';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let locked = root.dataset.inspect === 'true';
  let held = false;
  let transitionRunning = false;

  const readStored = () => {
    try { return sessionStorage.getItem(storageKey) === 'true'; }
    catch (_) { return false; }
  };

  const storeLocked = () => {
    try { sessionStorage.setItem(storageKey, String(locked)); }
    catch (_) {}
  };

  const updateButton = active => {
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? '返回手记视图' : '检查内容底层');
    button.title = active ? '返回手记视图（按住 ` 临时查看）' : '检查内容底层（按住 ` 临时查看）';
  };

  const updateArticleHeader = active => {
    document.querySelectorAll('.post-inspect-record').forEach(record => {
      const human = record.querySelector(':scope > .inspect-human');
      const machine = record.querySelector(':scope > .post-inspect-machine');
      if (!human || !machine) return;
      human.toggleAttribute('inert', active);
      human.setAttribute('aria-hidden', String(active));
      machine.toggleAttribute('inert', !active);
      machine.setAttribute('aria-hidden', String(!active));
    });
  };

  const commit = active => {
    root.dataset.inspect = String(active);
    updateButton(active);
    updateArticleHeader(active);
    dispatchEvent(new CustomEvent('xvsf:inspectchange', {
      detail: { active, locked, temporary: held && !locked }
    }));
  };

  const transitionTo = (active, anchor) => {
    if ((root.dataset.inspect === 'true') === active) {
      updateButton(active);
      return;
    }

    const apply = () => commit(active);
    if (!document.startViewTransition || reducedMotion.matches || document.hidden || transitionRunning) {
      apply();
      return;
    }

    const rect = anchor?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 36;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    transitionRunning = true;

    let transition;
    try { transition = document.startViewTransition(apply); }
    catch (_) {
      transitionRunning = false;
      apply();
      return;
    }

    transition.ready.then(() => {
      const frames = active
        ? { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }
        : { clipPath: [`circle(${radius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`] };
      root.animate(frames, {
        duration: 380,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
        pseudoElement: active ? '::view-transition-new(root)' : '::view-transition-old(root)'
      });
    }).catch(() => {});

    transition.finished.finally(() => { transitionRunning = false; });
  };

  const editableTarget = target => target instanceof Element && Boolean(
    target.closest('input, textarea, select, button, [contenteditable="true"], [role="textbox"]')
  );

  button.addEventListener('click', event => {
    event.stopPropagation();
    locked = !locked;
    storeLocked();
    transitionTo(locked || held, button);
  });

  addEventListener('keydown', event => {
    if (event.code !== 'Backquote' || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (editableTarget(event.target) || document.body.classList.contains('terminal-open')) return;
    event.preventDefault();
    held = true;
    commit(true);
  });

  addEventListener('keyup', event => {
    if (event.code !== 'Backquote' || !held) return;
    event.preventDefault();
    held = false;
    commit(locked);
  });

  addEventListener('blur', () => {
    if (!held) return;
    held = false;
    commit(locked);
  });

  addEventListener('pageshow', () => {
    locked = readStored();
    held = false;
    commit(locked);
  });

  locked = readStored() || locked;
  commit(locked);
})();
