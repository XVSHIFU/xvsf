(() => {
  const inspector = document.querySelector('[data-series-inspector]');
  if (!inspector) return;

  const links = [...document.querySelectorAll('[data-series-chapter]')];
  if (!links.length) return;

  const fields = {
    number: inspector.querySelector('[data-series-number]'),
    title: inspector.querySelector('[data-series-title]'),
    date: inspector.querySelector('[data-series-date]'),
    path: inspector.querySelector('[data-series-path]')
  };

  const select = link => {
    links.forEach(item => item.closest('li')?.classList.toggle('is-previewed', item === link));
    fields.number.textContent = link.dataset.number || '';
    fields.title.textContent = link.dataset.title || '';
    fields.date.textContent = link.dataset.date || '';
    fields.path.textContent = link.dataset.path || '';
    const isoDate = (link.dataset.date || '').replaceAll('.', '-');
    if (isoDate) fields.date.dateTime = isoDate;
  };

  links.forEach(link => {
    link.addEventListener('pointerenter', () => select(link), { passive: true });
    link.addEventListener('focus', () => select(link));
  });

  select(links[0]);
})();
