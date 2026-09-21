(() => {
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const reader = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let tocObserver;
  const el = (tag, text, cls) => { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (cls) node.className = cls; return node; };
  const send = (type, extra = {}) => { if (parent !== window) parent.postMessage({ channel: 'xvsf-terminal', type, ...extra }, location.origin); };
  try { document.documentElement.dataset.theme = parent.document.documentElement.dataset.theme || 'light'; } catch { /* Standalone document. */ }
  document.documentElement.dataset.inputMode = 'pointer';
  window.addEventListener('pointerdown', () => { document.documentElement.dataset.inputMode = 'pointer'; }, true);
  window.addEventListener('keydown', event => { if (event.key === 'Tab') document.documentElement.dataset.inputMode = 'keyboard'; }, true);
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent || event.data?.channel !== 'xvsf-terminal') return;
    if (event.data.type === 'theme' && ['light', 'dark'].includes(event.data.theme)) document.documentElement.dataset.theme = event.data.theme;
    if (event.data.type === 'focus') $('#reader-back').focus();
  });
function buildToc(){tocObserver?.disconnect();reader.classList.remove('toc-open');$('#reader-toc-toggle').setAttribute('aria-expanded','false');const toc=$('#toc');toc.replaceChildren();const list=el('ul',undefined,'toc-list');toc.append(list);const stack=[{level:0,list,item:null}];const heads=all('#article-body h1[id],#article-body h2[id],#article-body h3[id],#article-body h4[id],#article-body h5[id],#article-body h6[id]');const links=new Map();heads.forEach(h=>{const level=Number(h.tagName.slice(1));while(stack.length>1&&stack.at(-1).level>=level)stack.pop();const parent=stack.at(-1);let target=parent.list;if(parent.item){if(!parent.childList){parent.childList=el('ul',undefined,'toc-list');parent.item.append(parent.childList)}target=parent.childList}const item=el('li',undefined,'toc-item');item.dataset.level=String(level);const a=el('a');a.href='#'+encodeURIComponent(h.id);a.append(el('span','#'.repeat(level),'toc-mark'),el('span',h.textContent.replace(/#$/,'').trim(),'toc-label'));a.firstChild.setAttribute('aria-hidden','true');a.addEventListener('click',e=>{e.preventDefault();h.scrollIntoView({block:'start',behavior:reduced.matches?'auto':'smooth'});reader.classList.remove('toc-open');$('#reader-toc-toggle').setAttribute('aria-expanded','false')});item.append(a);target.append(item);links.set(h,a);stack.push({level,item,list:target,childList:null})});if(heads.length){links.get(heads[0]).setAttribute('aria-current','location');tocObserver=new IntersectionObserver(entries=>{const active=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!active)return;links.forEach(a=>a.removeAttribute('aria-current'));links.get(active.target)?.setAttribute('aria-current','location')},{root:$('#reader-scroll'),rootMargin:'0px 0px -65% 0px',threshold:0});heads.forEach(h=>tocObserver.observe(h))}}
$('#reader-toc-toggle').addEventListener('click',()=>{$('#reader-toc-toggle').setAttribute('aria-expanded',String(reader.classList.toggle('toc-open')))});

  buildToc();
  $('#reader-back').addEventListener('click', () => { if (parent !== window) send('close'); else location.href = $('#original').href; });
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a');
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.closest('#toc') || anchor.id === 'original') return;
    const raw = anchor.getAttribute('href');
    if (!raw) return;
    if (raw.startsWith('#')) {
      event.preventDefault();
      try { document.getElementById(decodeURIComponent(raw.slice(1)))?.scrollIntoView({ block: 'start' }); } catch { /* Malformed fragment. */ }
      return;
    }
    const url = new URL(anchor.href);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    if (url.origin === location.origin && parent !== window) { event.preventDefault(); send('navigate', { url: url.href }); }
    else { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
  });
  window.addEventListener('keydown', event => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.ctrlKey && event.key.toLowerCase() === 'l' && parent !== window) { event.preventDefault(); event.stopImmediatePropagation(); send('clear'); return; }
    if (event.key !== 'Escape') return;
    if (document.querySelector('#lightbox-overlay:not([hidden]),#mermaid-dialog:not([hidden])')) return;
    event.preventDefault();
    if (reader.classList.contains('toc-open')) { reader.classList.remove('toc-open'); $('#reader-toc-toggle').setAttribute('aria-expanded', 'false'); }
    else send('close');
  }, true);
  function followHash() {
    if (!location.hash) return;
    try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start' }); } catch { /* Malformed external fragment. */ }
  }
  window.addEventListener('load', followHash, { once: true });
  window.addEventListener('hashchange', followHash);
  if (location.hash) $('#original').hash = location.hash;
  send('ready');
})();
