/* Animate the original tutor cards without moving their desktop section. */
(() => {
  const section = document.querySelector('.guru-section');
  const list = section?.querySelector('.cardlist');
  if (!list) return;
  const cards = [...list.children];
  const slider = section.querySelector('.slider1');
  const left = slider.querySelector(
    '.button123:has(img[src="./public/vuesaxlineararrowleft1.svg"])',
  );
  const right = slider.querySelector(
    '.button123:has(img[src="./public/vuesaxlineararrowright2.svg"])',
  );
  const pagination = slider.querySelector('.pagination');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let points = [],
    markers = [],
    visible = false,
    hovering = false,
    userPaused = false,
    holdUntil = 0;
  const announcement = document.createElement('span');
  announcement.className = 'visually-hidden';
  announcement.setAttribute('aria-live', 'polite');
  section.append(announcement);
  list.tabIndex = 0;
  list.setAttribute('role', 'region');
  list.setAttribute('aria-label', 'Guru Terbaik Kami');
  list.setAttribute('aria-roledescription', 'carousel');
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'carousel-pause';
  slider.append(pause);
  function pauseLabel() {
    pause.hidden = reduced.matches;
    pause.textContent = userPaused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', userPaused ? 'Lanjutkan animasi guru' : 'Jeda animasi guru');
  }
  pause.onclick = () => {
    userPaused = !userPaused;
    pauseLabel();
  };
  function index() {
    return points.reduce(
      (best, point, i) =>
        Math.abs(point - list.scrollLeft) < Math.abs(points[best] - list.scrollLeft) ? i : best,
      0,
    );
  }
  function update() {
    const current = index();
    markers.forEach((node, i) => {
      node.className = i === current ? 'pagination-child' : 'pagination-item';
      node.setAttribute('aria-current', String(i === current));
    });
    left?.setAttribute('aria-disabled', String(current === 0));
    right?.setAttribute('aria-disabled', String(current === points.length - 1));
  }
  function go(next, manual = true) {
    next = Math.max(0, Math.min(points.length - 1, next));
    if (manual) {
      holdUntil = Date.now() + 6000;
      announcement.textContent = `Halaman guru ${next + 1} dari ${points.length}`;
    }
    list.scrollTo({ left: points[next], behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  function measure() {
    const max = Math.max(0, list.scrollWidth - list.clientWidth);
    points = [
      ...new Set(cards.map((card) => Math.min(max, card.offsetLeft - cards[0].offsetLeft))),
    ];
    if (!points.includes(max)) points.push(max);
    pagination.replaceChildren(
      ...points.map((point, i) => {
        const node = document.createElement('button');
        node.type = 'button';
        node.setAttribute('aria-label', 'Halaman guru ' + (i + 1));
        node.onclick = () => go(i);
        return node;
      }),
    );
    markers = [...pagination.children];
    update();
  }
  function control(node, label, direction) {
    if (!node) return;
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', label);
    node.onclick = () => go(index() + direction);
    node.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        node.click();
      }
    };
  }
  control(left, 'Tutor sebelumnya', -1);
  control(right, 'Tutor berikutnya', 1);
  list.addEventListener('keydown', (event) => {
    if (event.target !== list) return;
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      go(
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? points.length - 1
            : index() + (event.key === 'ArrowRight' ? 1 : -1),
      );
    }
  });
  list.addEventListener('scroll', update, { passive: true });
  list.addEventListener(
    'pointerdown',
    () => {
      holdUntil = Date.now() + 10000;
    },
    { passive: true },
  );
  section.addEventListener('mouseenter', () => {
    hovering = true;
  });
  section.addEventListener('mouseleave', () => {
    hovering = false;
  });
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.15 },
  ).observe(section);
  new ResizeObserver(measure).observe(list);
  reduced.addEventListener('change', pauseLabel);
  pauseLabel();
  measure();
  setInterval(() => {
    if (
      !visible ||
      reduced.matches ||
      userPaused ||
      hovering ||
      document.hidden ||
      section.contains(document.activeElement) ||
      document.body.classList.contains('popup-active') ||
      Date.now() < holdUntil ||
      points.length < 2
    )
      return;
    go((index() + 1) % points.length, false);
  }, 5000);
})();
