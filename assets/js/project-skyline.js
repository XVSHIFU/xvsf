import { mountSkyline } from './contribution-skyline.mjs';
const panel = document.querySelector('.contribution-panel');
if (panel) {
  const days = [...panel.querySelectorAll('.contribution-day')].map(el => ({ date: el.dataset.date, count: Number(el.dataset.count) }));
  const calendar = panel.querySelector('.contribution-scroll');
  const controls = document.createElement('div'); controls.className = 'activity-view-switch'; controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', '贡献视图');
  const figure = document.createElement('figure'); figure.className = 'project-skyline'; figure.hidden = true;
  const canvas = document.createElement('canvas'); canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', '贡献天际线，高度表示每日贡献数量'); figure.append(canvas);
  let dispose;
  for (const [value, name] of [['calendar', '日历'], ['skyline', '天际线']]) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = name; button.setAttribute('aria-pressed', String(value === 'calendar'));
    button.addEventListener('click', () => {
      const useSkyline = value === 'skyline'; calendar.hidden = useSkyline; figure.hidden = !useSkyline;
      controls.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button)));
      dispose?.(); dispose = undefined;
      if (useSkyline) dispose = mountSkyline(canvas, days);
    }); controls.append(button);
  }
  panel.prepend(controls); calendar.after(figure);
}
