document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('.post-content');
  containers.forEach(container => {
    const pres = Array.from(container.querySelectorAll('pre'));
    pres.forEach(pre => {
      // 如果已经在折叠容器里（例如 <details>，或类名包含 collapse/fold 的容器），则跳过，避免嵌套折叠
      if (pre.closest('details') || pre.closest('[class*="collapse"]') || pre.closest('[class*="collaps"]') || pre.closest('[class*="fold"]') || pre.closest('[data-no-collapse]') || pre.closest('[data-collapse]')) return;

      // 判断是否需要折叠：只折叠较长的代码块，避免把短代码也隐藏
      const text = pre.textContent || '';
      const lines = text.split('\n').length;
      const height = pre.scrollHeight || pre.getBoundingClientRect().height || 0;
      const LINE_THRESHOLD = 10; // 超过多少行才折叠
      const HEIGHT_THRESHOLD = 160; // 或者高度超过多少像素才折叠
      if (lines <= LINE_THRESHOLD && height <= HEIGHT_THRESHOLD) {
        return; // 保持原样，不折叠
      }

      const codeEl = pre.querySelector('code');
      let lang = '';
      if (codeEl) {
        const cls = Array.from(codeEl.classList).find(c => c.startsWith('language-') || c.startsWith('lang-'));
        if (cls) lang = cls.replace(/^language-/, '').replace(/^lang-/, '');
      }

      const details = document.createElement('details');
      details.className = 'code-collapse';

      const summary = document.createElement('summary');
      const left = document.createElement('span');
      left.textContent = '代码';
      const right = document.createElement('span');
      right.className = 'lang';
      right.textContent = lang || '';

      summary.appendChild(left);
      summary.appendChild(right);

      const preClone = pre.cloneNode(true);

      details.appendChild(summary);
      details.appendChild(preClone);

      pre.replaceWith(details);
    });
  });
});
