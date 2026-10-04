/* Keep the original cards and controls; derive bounds from the rendered list. */
(() => {
  const list = document.querySelector('.cardstuff');
  if (!list) return;
  const left = document.querySelector(
    '.button999:has(img[src="./public/vuesaxlineararrowleft.svg"])',
  );
  const right = document.querySelector(
    '.button999:has(img[src="./public/vuesaxlineararrowright.svg"])',
  );
  const markers = [...document.querySelectorAll('.slider-bar-item, .slider-bar-child')];
  const active = 'slider-bar-child',
    inactive = 'slider-bar-item';
  function update() {
    const max = Math.max(0, list.scrollWidth - list.clientWidth);
    const index = max ? Math.round((list.scrollLeft / max) * (markers.length - 1)) : 0;
    markers.forEach((node, i) => {
      node.classList.toggle(active, i === index);
      node.classList.toggle(inactive, i !== index);
    });
    left?.setAttribute('aria-disabled', String(list.scrollLeft <= 1));
    right?.setAttribute('aria-disabled', String(list.scrollLeft >= max - 1));
  }
  function move(direction) {
    list.scrollBy({
      left:
        direction *
        Math.min(
          list.clientWidth,
          list.firstElementChild?.getBoundingClientRect().width + 24 || list.clientWidth,
        ),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
  function control(node, label, handler) {
    if (!node) return;
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', label);
    node.onclick = handler;
    node.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    };
  }
  control(left, 'Promo sebelumnya', () => move(-1));
  control(right, 'Promo berikutnya', () => move(1));
  markers.forEach((node, index) =>
    control(node, 'Halaman ' + (index + 1), () =>
      list.scrollTo({
        left: ((list.scrollWidth - list.clientWidth) * index) / Math.max(1, markers.length - 1),
        behavior: 'smooth',
      }),
    ),
  );
  list.addEventListener('scroll', update);
  window.addEventListener('resize', update);
  update();
})();
