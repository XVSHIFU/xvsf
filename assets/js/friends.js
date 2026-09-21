/* Friend hover-card interaction inspired by joyehuang/blog (Apache-2.0).
 * Rewritten with a shared bounded popover and explicit local preview placeholders.
 * See docs/joye-interaction-reference.md and static/licenses/joye-blog.txt. */
(() => {
  const page = document.querySelector('.links-page');
  if (!page) return;
  const sky = page.querySelector('[data-friend-sky]');
  const preview = page.querySelector('.friend-preview');
  const records = [...page.querySelectorAll('[data-friend]')];
  const svgNS = 'http://www.w3.org/2000/svg';
  let selected = null;
  let activeStar = null;
  let closeTimer;
  const hide = () => {
    clearTimeout(closeTimer);
    preview.hidden = true;
    sky.querySelectorAll('.is-selected').forEach(el => el.classList.remove('is-selected'));
    activeStar?.setAttribute('aria-expanded', 'false');
    selected = null; activeStar = null;
  };
  const position = star => {
    const bounds = sky.getBoundingClientRect(); const rect = star.getBoundingClientRect();
    const width = preview.offsetWidth; const height = preview.offsetHeight;
    const x = Math.max(8, Math.min(bounds.width - width - 8, rect.left + rect.width / 2 - bounds.left - width / 2));
    const below = rect.bottom - bounds.top + 12;
    const above = rect.top - bounds.top - height - 12;
    const y = below + height <= bounds.height - 8 ? below : Math.max(8, above);
    preview.style.left = x + 'px'; preview.style.top = y + 'px';
  };
  const select = (record, star) => {
    clearTimeout(closeTimer);
    if (selected === record) { position(star); return; }
    hide(); selected = record; activeStar = star;
    star.classList.add('is-selected'); star.setAttribute('aria-expanded', 'true');
    sky.querySelector('line[data-key="' + record.dataset.key + '"]').classList.add('is-selected');
    preview.querySelector('.friend-preview-name').textContent = record.dataset.name;
    preview.querySelector('.friend-preview-description').textContent = record.dataset.description;
    preview.querySelector('.friend-preview-meta').textContent = record.dataset.placeholder === 'true' ? '临时占位 · 等待小站加入' : record.dataset.since ? '互换友链 · ' + record.dataset.since : '朋友的小站';
    const note = preview.querySelector('.friend-preview-note'); note.textContent = record.dataset.note; note.hidden = !record.dataset.note;
    const link = preview.querySelector('a');
    link.hidden = record.dataset.placeholder === 'true';
    if (!link.hidden) { link.href = record.dataset.url; link.setAttribute('aria-label', '访问 ' + record.dataset.name); }
    else link.removeAttribute('href');
    preview.hidden = false; position(star);
  };
  if (records.length && sky && preview) {
    sky.append(preview);
    records.slice(0, 12).forEach(record => {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', '400'); line.setAttribute('y1', '200'); line.dataset.key = record.dataset.key;
      sky.querySelector('.friend-connections').append(line);
      const placeholder = record.dataset.placeholder === 'true';
      const star = document.createElement(placeholder ? 'button' : 'a');
      star.className = 'friend-star';
      if (placeholder) star.type = 'button';
      else { star.href = record.dataset.url; star.target = '_blank'; star.rel = 'noopener noreferrer'; }
      star.setAttribute('aria-label', record.dataset.name + (placeholder ? '，临时占位' : ''));
      star.setAttribute('aria-controls', preview.id); star.setAttribute('aria-expanded', 'false');
      const avatar = record.querySelector('.friend-avatar').cloneNode(true);
      const label = document.createElement('span'); label.className = 'friend-star-label'; label.textContent = record.dataset.name;
      star.append(avatar, label);
      star.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(record, star); });
      star.addEventListener('pointerleave', () => { closeTimer = setTimeout(() => { if (!star.matches(':focus-visible') && !preview.contains(document.activeElement)) hide(); }, 180); });
      star.addEventListener('focus', () => select(record, star));
      star.addEventListener('click', event => {
        if (placeholder || event.pointerType === 'touch' || matchMedia('(hover: none)').matches) {
          event.preventDefault(); select(record, star);
        }
      });
      sky.append(star);
    });
    preview.addEventListener('pointerenter', () => clearTimeout(closeTimer));
    preview.addEventListener('pointerleave', () => { closeTimer = setTimeout(() => { if (!preview.contains(document.activeElement)) hide(); }, 180); });
    sky.addEventListener('focusout', event => { if (!sky.contains(event.relatedTarget)) hide(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    document.addEventListener('pointerdown', event => { if (!sky.contains(event.target)) hide(); });
    const narrow = matchMedia('(max-width: 760px)');
    const caption = document.createElement('p'); caption.className = 'friend-map-caption'; sky.after(caption);
    const layout = () => {
      hide();
      const links = [...sky.querySelectorAll('.friend-star')]; const lines = [...sky.querySelectorAll('.friend-connections line')];
      const count = Math.min(links.length, narrow.matches ? 6 : 12);
      links.forEach((star, index) => {
        star.hidden = index >= count; lines[index].style.display = star.hidden ? 'none' : '';
        if (star.hidden) return;
        const inner = count > 6 && index < 6;
        const ringCount = count > 6 ? (inner ? 6 : count - 6) : count;
        const ringIndex = inner || count <= 6 ? index : index - 6;
        const angle = -Math.PI / 2 + ringIndex * 2 * Math.PI / ringCount + (inner ? Math.PI / 6 : 0);
        const x = 50 + Math.cos(angle) * (inner ? 23 : 37); const y = 50 + Math.sin(angle) * (inner ? 22 : 36);
        star.style.setProperty('--star-x', x + '%'); star.style.setProperty('--star-y', y + '%');
        lines[index].setAttribute('x2', String(x * 8)); lines[index].setAttribute('y2', String(y * 4));
      });
      caption.hidden = records.length <= count;
      caption.textContent = '星图 ' + count + ' / ' + records.length + ' · 完整名单见下方';
    };
    sky.hidden = false; layout(); narrow.addEventListener('change', layout); window.addEventListener('resize', () => { if (activeStar) position(activeStar); });
    if (records.every(record => record.dataset.placeholder === 'true')) page.querySelector('.friend-list').hidden = true;
  }
  page.querySelectorAll('.friend-avatar img').forEach(img => {
    const fallback = () => {
      const name = img.closest('[data-friend]')?.dataset.name || img.closest('.friend-star')?.getAttribute('aria-label') || '';
      img.replaceWith(document.createTextNode([...name][0] || ''));
    };
    img.addEventListener('error', fallback, { once: true });
    if (img.complete && !img.naturalWidth) fallback();
  });
  const status = page.querySelector('.copy-status');
  const copy = async (text, label) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = label + '已复制';
    } catch {
      status.textContent = '无法访问剪贴板，请选中下方资料手动复制。';
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(page.querySelector('.link-info'));
      selection.removeAllRanges(); selection.addRange(range);
    }
  };
  const all = page.querySelector('[data-copy-all]');
  all.hidden = false;
  all.addEventListener('click', () => copy([...page.querySelectorAll('.link-info p')].map(row => row.textContent).join('\n'), '本站资料'));
})();
