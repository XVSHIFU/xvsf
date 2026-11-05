(() => {
  const atmosphere = document.querySelector('.home-atmosphere');
  if (!atmosphere || atmosphere.dataset.atmosphereReady === 'true') return;
  atmosphere.dataset.atmosphereReady = 'true';

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let frame = 0;
  let rect = null;
  let enabled = false;
  let latest = null;

  const setRestingState = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    latest = null;
    atmosphere.dataset.pointerActive = 'false';
    atmosphere.style.setProperty('--home-pointer-x', '50%');
    atmosphere.style.setProperty('--home-pointer-y', '22%');
    atmosphere.style.setProperty('--home-shift-x', '0px');
    atmosphere.style.setProperty('--home-shift-y', '0px');
  };

  const measure = () => { rect = atmosphere.getBoundingClientRect(); };

  const render = () => {
    frame = 0;
    if (!enabled || !latest || document.hidden) return;
    if (!rect) measure();
    const x = Math.max(0, Math.min(rect.width, latest.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, latest.clientY - rect.top));
    const shiftX = rect.width ? ((x / rect.width) - 0.5) * 5 : 0;
    const shiftY = rect.height ? ((y / rect.height) - 0.5) * 5 : 0;
    atmosphere.style.setProperty('--home-pointer-x', x + 'px');
    atmosphere.style.setProperty('--home-pointer-y', y + 'px');
    atmosphere.style.setProperty('--home-shift-x', shiftX.toFixed(2) + 'px');
    atmosphere.style.setProperty('--home-shift-y', shiftY.toFixed(2) + 'px');
    atmosphere.dataset.pointerActive = 'true';
  };

  const onPointerMove = event => {
    if (!enabled || event.pointerType === 'touch') return;
    latest = event;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const onPointerLeave = event => {
    if (event.relatedTarget === null) setRestingState();
  };

  const addInteraction = () => {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerout', onPointerLeave, { passive: true });
  };

  const removeInteraction = () => {
    window.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerout', onPointerLeave);
  };

  const sync = () => {
    const next = finePointer.matches && !reducedMotion.matches && !connection?.saveData;
    if (next === enabled) return;
    enabled = next;
    if (enabled) addInteraction();
    else { removeInteraction(); setRestingState(); }
  };

  window.addEventListener('resize', () => { rect = null; }, { passive: true });
  window.addEventListener('blur', setRestingState);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setRestingState();
    else rect = null;
  });
  finePointer.addEventListener?.('change', sync);
  reducedMotion.addEventListener?.('change', sync);
  connection?.addEventListener?.('change', sync);
  setRestingState();
  sync();
})();
