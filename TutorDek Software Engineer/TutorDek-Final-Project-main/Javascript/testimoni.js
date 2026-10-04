/* Rotate the original testimonial artwork; these are sample project stories. */
(() => {
  const left = document.getElementById('testi-left'),
    right = document.getElementById('testi-right');
  const main = document.querySelector('.active-content > img');
  const sides = [...document.querySelectorAll('.slider-inactive-content > img')];
  if (!left || !right || !main || sides.length !== 2) return;
  const art = [main.src, ...sides.map((node) => node.src)];
  let index = 0;
  function move(direction) {
    index = (index + direction + art.length) % art.length;
    main.src = art[index];
    sides[0].src = art[(index + 2) % 3];
    sides[1].src = art[(index + 1) % 3];
  }
  for (const [node, direction, label] of [
    [left, -1, 'Testimoni sebelumnya'],
    [right, 1, 'Testimoni berikutnya'],
  ]) {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', label);
    node.onclick = () => move(direction);
    node.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        move(direction);
      }
    };
  }
})();
