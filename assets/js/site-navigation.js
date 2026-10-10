(() => {
  const more = document.querySelector('.nav-more');
  if (!more) return;
  document.addEventListener('click', event => { if (!more.contains(event.target)) more.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && more.open) { more.open = false; more.querySelector('summary').focus(); event.preventDefault(); } });
})();
