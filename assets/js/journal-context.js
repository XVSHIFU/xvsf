(() => {
  const marker = document.querySelector('[data-journal-context]');
  if (!marker) return;

  const indexNode = marker.querySelector('[data-journal-context-index]');
  const labelNode = marker.querySelector('[data-journal-context-label]');
  const totalNode = marker.querySelector('[data-journal-context-total]');
  if (!indexNode || !labelNode || !totalNode) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  let landmarks = [];
  let activeKey = '';
  let animationTimer;

  const formatNumber = number => String(number).padStart(2, '0');

  const shortLabel = value => {
    const label = String(value || '手记').replace(/\s+/g, ' ').trim() || '手记';
    const characters = Array.from(label);
    return characters.length > 18 ? `${characters.slice(0, 18).join('')}…` : label;
  };

  const update = (index, total, label, animate = true) => {
    const safeTotal = Math.max(1, total);
    const safeIndex = Math.max(1, Math.min(index, safeTotal));
    const nextLabel = shortLabel(label);
    const nextKey = `${safeIndex}:${safeTotal}:${nextLabel}`;
    if (nextKey === activeKey) return;
    activeKey = nextKey;

    marker.hidden = false;
    indexNode.textContent = formatNumber(safeIndex);
    totalNode.textContent = `/ ${formatNumber(safeTotal)}`;
    labelNode.textContent = nextLabel;

    if (!animate || reducedMotion.matches) return;
    marker.classList.remove('is-updating');
    requestAnimationFrame(() => marker.classList.add('is-updating'));
    clearTimeout(animationTimer);
    animationTimer = setTimeout(() => marker.classList.remove('is-updating'), 240);
  };

  const visible = element => element instanceof HTMLElement
    && element.isConnected
    && !element.hidden
    && !element.closest('[hidden], [aria-hidden="true"]')
    && element.getClientRects().length > 0;

  const landmark = (element, label) => element && visible(element)
    ? { element, label: shortLabel(label) }
    : null;

  const elementLabel = (element, selector = 'h1, h2, h3') => {
    if (!element) return '手记';
    const source = element.matches('h1, h2, h3') ? element : element.querySelector(selector);
    return source?.textContent || element.dataset.journalContextTitle || '手记';
  };

  const collectLandmarks = () => {
    if (document.body.classList.contains('home-page')) {
      return [
        landmark(document.querySelector('.home-featured'), '推荐阅读'),
        landmark(document.querySelector('.home-spotlights'), '专题阅读'),
        landmark(document.querySelector('.home-latest'), '最近更新')
      ].filter(Boolean);
    }

    const listHeader = document.querySelector('.journal-page-header');
    const listRows = [...document.querySelectorAll('.journal-post-list .journal-post-row')];
    if (listHeader || listRows.length) {
      return [
        landmark(listHeader, elementLabel(listHeader)),
        ...listRows.map(row => landmark(row, elementLabel(row, '.journal-post-human h2')))
      ].filter(Boolean);
    }

    const archiveHeader = document.querySelector('.page-header');
    const archiveYears = [...document.querySelectorAll('.timeline-year')];
    if (archiveYears.length) {
      return [
        landmark(archiveHeader, elementLabel(archiveHeader)),
        ...archiveYears.map(year => landmark(year, elementLabel(year, '.timeline-year-title')))
      ].filter(Boolean);
    }

    const articleHeader = document.querySelector('.post-single > .post-header, .post-header');
    const articleHeadings = [...document.querySelectorAll('.post-single .post-content h2[id]')];
    if (articleHeader || articleHeadings.length) {
      return [
        landmark(articleHeader, elementLabel(articleHeader)),
        ...articleHeadings.map(heading => landmark(heading, elementLabel(heading)))
      ].filter(Boolean);
    }

    return [...document.querySelectorAll('main h1, main h2')]
      .map(element => landmark(element, elementLabel(element)))
      .filter(Boolean);
  };

  const currentLandmark = () => {
    const readingLine = innerHeight * 0.28;
    let current = 0;
    landmarks.forEach((item, index) => {
      if (item.element.getBoundingClientRect().top <= readingLine) current = index;
    });
    return current;
  };

  const syncObservedContext = (animate = true) => {
    if (!landmarks.length) {
      marker.hidden = true;
      return;
    }
    const index = currentLandmark();
    update(index + 1, landmarks.length, landmarks[index].label, animate);
  };

  const observePage = () => {
    observer?.disconnect();
    landmarks = collectLandmarks();
    activeKey = '';
    syncObservedContext(false);
    if (!landmarks.length || !('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(() => syncObservedContext(), {
      rootMargin: '-24% 0px -68% 0px',
      threshold: 0
    });
    landmarks.forEach(item => observer.observe(item.element));
  };

  const taxonomy = document.querySelector('[data-taxonomy-explorer]');
  if (taxonomy) {
    const syncTaxonomy = (animate = true) => {
      const selectors = [...taxonomy.querySelectorAll('.taxonomy-selector')];
      const active = taxonomy.querySelector('.taxonomy-selector[aria-current="true"]') || selectors[0];
      if (!active) return;
      const index = Math.max(0, selectors.indexOf(active));
      update(index + 1, selectors.length, elementLabel(active, '.taxonomy-selector-name'), animate);
    };

    new MutationObserver(() => syncTaxonomy()).observe(taxonomy, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-current']
    });
    addEventListener('pageshow', () => syncTaxonomy(false));
    syncTaxonomy(false);
    return;
  }

  const toc = document.getElementById('article-toc');
  if (toc) {
    const links = [...toc.querySelectorAll('.article-toc-link')];
    const syncToc = (detail, animate = true) => {
      const active = toc.querySelector('.article-toc-link[aria-current="location"]') || links[0];
      const index = Number(detail?.index) || Math.max(1, links.indexOf(active) + 1);
      const total = Number(detail?.total) || links.length || 1;
      const label = detail?.label || active?.textContent || '正文';
      update(index, total, label, animate);
    };

    document.addEventListener('xvsf:sectionchange', event => syncToc(event.detail));
    addEventListener('pageshow', () => syncToc(null, false));
    syncToc(null, false);
    return;
  }

  addEventListener('pageshow', () => observePage());
  observePage();
})();
