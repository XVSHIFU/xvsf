/* Interaction adapted from joyehuang/blog (Apache-2.0).
 * Changed for Hugo/SVG, public snapshots, keyboard and touch support.
 * Source and license: docs/joye-interaction-reference.md, /licenses/joye-blog.txt. */
(() => {
  const svg = document.querySelector('.contribution-calendar');
  if (!svg) return;
  const panel = svg.closest('.contribution-panel');
  const scroll = svg.closest('.contribution-scroll');
  const days = [...svg.querySelectorAll('.contribution-day')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const element = (tag, attrs) => { const node = document.createElementNS(ns, tag); for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value); return node; };
  const defs = element('defs', {});
  const gradient = element('radialGradient', { id: 'contribution-light', gradientUnits: 'userSpaceOnUse', cx: '-200', cy: '-200', r: '90' });
  gradient.append(element('stop', { offset: '0', 'stop-color': 'white' }), element('stop', { offset: '1', 'stop-color': 'black' }));
  const mask = element('mask', { id: 'contribution-mask', maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '746', height: '124' });
  mask.append(element('rect', { width: '746', height: '124', fill: 'url(#contribution-light)' }));
  defs.append(gradient, mask); svg.prepend(defs);
  const bright = element('g', { class: 'contribution-bright', mask: 'url(#contribution-mask)', 'aria-hidden': 'true' });
  days.forEach(day => { const clone = day.cloneNode(false); clone.removeAttribute('aria-label'); clone.removeAttribute('data-date'); clone.removeAttribute('data-count'); clone.setAttribute('class', day.getAttribute('class').replace('contribution-day', 'contribution-glow')); bright.append(clone); });
  svg.append(bright);
  const tip = document.createElement('div'); tip.className = 'contribution-tooltip'; tip.id = 'contribution-tooltip'; tip.role = 'tooltip'; tip.hidden = true; panel.append(tip);
  const firstLine = document.createElement('div'); const secondLine = document.createElement('div'); tip.append(firstLine, secondLine);
  const odometer = parent => {
    const box = document.createElement('span'); box.className = 'contribution-number'; box.setAttribute('aria-hidden', 'true'); parent.append(box);
    return number => {
      const digits = String(number);
      while (box.children.length < digits.length) {
        const column = document.createElement('span'); column.className = 'contribution-digit';
        const reel = document.createElement('span'); reel.className = 'contribution-reel';
        for (let i = 0; i < 10; i++) { const digit = document.createElement('span'); digit.textContent = i; reel.append(digit); }
        column.append(reel); box.prepend(column);
      }
      const padded = digits.padStart(box.children.length, '0');
      [...box.children].forEach((column, index) => { column.hidden = index < padded.length - digits.length; column.firstChild.style.transform = 'translateY(-' + padded[index] + 'em)'; column.firstChild.style.transitionDelay = reduced.matches ? '0ms' : Math.max(0, index - (padded.length - digits.length)) * 50 + 'ms'; });
    };
  };
  const setCount = odometer(firstLine); firstLine.append(' 次贡献');
  const setYear = odometer(secondLine); secondLine.append(' 年 ');
  const month = document.createElement('span'); secondLine.append(month, ' 月 ');
  const setDay = odometer(secondLine); secondLine.append(' 日');
  let active = null;
  let frame = 0;
  const hide = () => { cancelAnimationFrame(frame); tip.hidden = true; svg.classList.remove('is-interacting'); active?.classList.remove('is-active'); active?.removeAttribute('aria-describedby'); active = null; };
  const position = cell => {
    const bounds = panel.getBoundingClientRect(); const rect = cell.getBoundingClientRect();
    const width = tip.offsetWidth; const height = tip.offsetHeight;
    const x = Math.max(8, Math.min(bounds.width - width - 8, rect.left + rect.width / 2 - bounds.left - width / 2));
    const above = rect.top - bounds.top - height - 10;
    tip.style.left = x + 'px'; tip.style.top = (above >= 8 ? above : rect.bottom - bounds.top + 10) + 'px';
  };
  const show = cell => {
    if (!cell) return;
    if (active !== cell) {
      active?.classList.remove('is-active'); active?.removeAttribute('aria-describedby'); active = cell;
      active.classList.add('is-active'); active.setAttribute('aria-describedby', tip.id);
      const parts = cell.dataset.date.split('-'); const count = Number(cell.dataset.count);
      tip.hidden = false; tip.setAttribute('aria-label', cell.getAttribute('aria-label')); tip.dataset.date = cell.dataset.date; tip.dataset.count = count;
      month.textContent = Number(parts[1]);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { setCount(count); setYear(Number(parts[0])); setDay(Number(parts[2])); position(cell); });
    }
    const x = Number(cell.getAttribute('x')) + 5; const y = Number(cell.getAttribute('y')) + 5;
    gradient.setAttribute('cx', x); gradient.setAttribute('cy', y); svg.classList.add('is-interacting'); position(cell);
  };
  days.forEach((cell, index) => {
    cell.querySelector('title')?.remove(); // Custom tooltip replaces the delayed native title.
    cell.setAttribute('role', 'button'); cell.setAttribute('tabindex', index === days.length - 1 ? '0' : '-1');
    cell.addEventListener('focus', () => show(cell));
    cell.addEventListener('click', () => show(cell));
    cell.addEventListener('keydown', event => {
      if (event.key === 'Escape') { hide(); return; }
      if (['Enter', ' '].includes(event.key)) { event.preventDefault(); show(cell); return; }
      const delta = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[event.key];
      if (delta === undefined && !['Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? days.length - 1 : Math.max(0, Math.min(days.length - 1, index + delta));
      days.forEach(day => day.setAttribute('tabindex', '-1')); days[next].setAttribute('tabindex', '0'); days[next].focus();
    });
  });
  svg.addEventListener('pointermove', event => { if (event.pointerType === 'touch') return; const cell = event.target.closest('.contribution-day'); if (cell) show(cell); const matrix = svg.getScreenCTM(); if (matrix) { const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()); gradient.setAttribute('cx', point.x); gradient.setAttribute('cy', point.y); } });
  svg.addEventListener('pointerleave', () => { if (!svg.contains(document.activeElement)) hide(); });
  svg.addEventListener('focusout', event => { if (!svg.contains(event.relatedTarget)) hide(); });
  document.addEventListener('pointerdown', event => { if (!panel.contains(event.target)) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  scroll.addEventListener('scroll', () => { if (active && document.activeElement === active) position(active); else hide(); }, { passive: true }); window.addEventListener('resize', hide);
})();
