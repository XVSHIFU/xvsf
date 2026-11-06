(() => {
  document.querySelectorAll('[data-taxonomy-explorer]').forEach(explorer => {
    const selectors = [...explorer.querySelectorAll('[data-taxonomy-target]')];
    const panels = new Map(
      [...explorer.querySelectorAll('[data-taxonomy-panel]')].map(panel => [panel.id, panel])
    );
    if (!selectors.length || !panels.size) return;

    let active = selectors.find(selector => selector.getAttribute('aria-current') === 'true') || selectors[0];

    const activate = selector => {
      const panel = panels.get(selector.dataset.taxonomyTarget);
      if (!panel || selector === active) return;

      selectors.forEach(item => {
        const selected = item === selector;
        item.classList.toggle('is-active', selected);
        if (selected) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
      });

      panels.forEach(item => {
        const selected = item === panel;
        item.hidden = !selected;
        item.inert = !selected;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-hidden', String(!selected));
      });

      active = selector;
    };

    selectors.forEach(selector => {
      selector.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') activate(selector);
      });
      selector.addEventListener('focus', () => activate(selector));
    });
  });
})();
