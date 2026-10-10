// Isometric projection of the site's existing daily counts. No synthetic data.
export function mountSkyline(canvas, days) {
  const ctx = canvas.getContext('2d'); if (!ctx || !days.length) return () => {};
  const figure = canvas.parentElement;
  const label = document.createElement('label'); label.className = 'skyline-control';
  const text = document.createElement('span'); text.textContent = '选择日期';
  const slider = document.createElement('input'); slider.type = 'range'; slider.min = '0'; slider.max = String(days.length - 1); slider.value = String(days.length - 1); slider.setAttribute('aria-label', '选择贡献日期');
  const output = document.createElement('output'); output.setAttribute('aria-live', 'polite'); label.append(text, slider, output); figure.append(label);
  let selected = -1, boxes = [], raf = 0, start = 0, progress = 0, disposed = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const noMotion = () => reduced.matches || root.dataset.motion === 'reduce';
  const peak = Math.max(1, ...days.map(d => d.count));
  function select(index) { selected = index; slider.value = index; const day = days[index]; output.textContent = `${day.date} · ${day.count} 次`; slider.setAttribute('aria-valuetext', output.textContent); draw(); }
  function polygon(points, fill, stroke) { ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } }
  function draw() {
    if (disposed || !canvas.clientWidth) return;
    const width = canvas.clientWidth, height = canvas.clientHeight; const dpr = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    const dark = root.dataset.theme === 'dark'; const columns = Math.ceil(days.length / 7);
    const tile = (width - 38) / (columns + 7); const rise = Math.min(tile * .38, (height - 105) / (columns + 7)); const maxHeight = Math.min(85, height * .36);
    const baseline = Math.max(50, maxHeight + 12); boxes = [];
    for (let index = 0; index < days.length; index++) {
      const day = days[index]; const week = Math.floor(index / 7), row = index % 7;
      const x = 19 + (week + 7 - row) * tile, y = baseline + (week + row) * rise;
      const tall = (day.count ? 4 + Math.sqrt(day.count / peak) * maxHeight : 1) * progress;
      const top = dark ? ['#334253','#557895','#749dbb','#9fb8d4','#dcc4d8'] : ['#d4dfe8','#a4bfd6','#7e9fbe','#567ca3','#bb95ac'];
      const level = day.count ? Math.min(4, Math.ceil(day.count / peak * 4)) : 0;
      polygon([[x-tile*.9,y],[x,y+rise*.9],[x,y+rise*.9-tall],[x-tile*.9,y-tall]], dark ? '#34485d' : '#7994ae');
      polygon([[x,y+rise*.9],[x+tile*.9,y],[x+tile*.9,y-tall],[x,y+rise*.9-tall]], dark ? '#4c6581' : '#a7bbce');
      polygon([[x,y-rise*.9-tall],[x+tile*.9,y-tall],[x,y+rise*.9-tall],[x-tile*.9,y-tall]], top[level], index === selected ? (dark ? '#fff1dd' : '#2e5277') : null);
      boxes.push({ index, x, y: y - tall, width: tile, height: Math.max(6, tall + rise) });
    }
  }
  function tick(now) { if (!start) start = now; progress = noMotion() ? 1 : Math.min(1, (now - start) / 650); draw(); if (progress < 1 && !disposed) raf = requestAnimationFrame(tick); }
  function settle() { cancelAnimationFrame(raf); progress = 1; draw(); }
  function pointer(event) { const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left, y = event.clientY - rect.top; const box = [...boxes].reverse().find(b => Math.abs(x - b.x) <= b.width && y >= b.y - 4 && y <= b.y + b.height); if (box) select(box.index); }
  slider.addEventListener('input', () => select(Number(slider.value))); canvas.addEventListener('pointermove', pointer); canvas.addEventListener('click', pointer);
  const resize = new ResizeObserver(draw); resize.observe(canvas);
  const theme = new MutationObserver(settle); theme.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] }); reduced.addEventListener('change', settle);
  select(days.length - 1); raf = requestAnimationFrame(tick);
  return () => { disposed = true; cancelAnimationFrame(raf); resize.disconnect(); theme.disconnect(); reduced.removeEventListener('change', settle); canvas.removeEventListener('pointermove', pointer); canvas.removeEventListener('click', pointer); label.remove(); };
}
