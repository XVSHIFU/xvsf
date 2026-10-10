(() => {
  const script = document.querySelector('script[data-reading-manifest]');
  const reduced = matchMedia('(hover: hover)'); let data, pending, preview, target, timer;
  const normalized = value => { try { const url = new URL(value, location.href); return url.origin === location.origin ? decodeURIComponent(url.pathname) : ''; } catch { return ''; } };
  async function load() {
    if (data) return data;
    pending ||= fetch(script.dataset.readingManifest, { credentials: 'omit' }).then(r => { if (!r.ok) throw Error('manifest unavailable'); return r.json(); }).then(manifest => new Map(manifest.posts.map(post => [normalized(post.canonical_url), post]))).catch(() => new Map());
    data = await pending; return data;
  }
  function hide() { clearTimeout(timer); target?.removeAttribute('aria-describedby'); target = null; preview?.remove(); preview = null; }
  async function show(anchor) {
    hide(); target = anchor; const lookup = await load(); if (target !== anchor) return;
    const post = lookup.get(normalized(anchor.href)); if (!post || normalized(anchor.href) === normalized(location.href)) return;
    preview = document.createElement('div'); preview.id = 'reading-link-preview'; preview.className = 'link-preview'; preview.setAttribute('role', 'tooltip');
    const title = document.createElement('strong'); title.textContent = post.title;
    const desc = document.createElement('p'); desc.textContent = post.description || `${post.date} · 点击阅读全文`;
    preview.append(title, desc); document.body.append(preview); anchor.setAttribute('aria-describedby', preview.id);
    const rect = anchor.getBoundingClientRect(), box = preview.getBoundingClientRect();
    preview.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - box.width - 12))}px`;
    preview.style.top = `${rect.bottom + box.height + 20 < innerHeight ? rect.bottom + 10 : Math.max(12, rect.top - box.height - 10)}px`;
  }
  function candidate(event) { const anchor = event.target.closest('.post-content a[href],.backlinks a[href]'); return anchor && normalized(anchor.href) && !anchor.getAttribute('href').startsWith('#') ? anchor : null; }
  document.addEventListener('pointerover', event => { if (!reduced.matches) return; const anchor = candidate(event); if (!anchor) return; clearTimeout(timer); timer = setTimeout(() => show(anchor), 280); });
  document.addEventListener('pointerout', event => { if (candidate(event) && !event.target.contains(event.relatedTarget)) hide(); });
  document.addEventListener('focusin', event => { const anchor = candidate(event); if (anchor) show(anchor); });
  document.addEventListener('focusout', hide); window.addEventListener('scroll', hide, true);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
})();
