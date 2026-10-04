/* Same-origin services for the original TutorDek pages. */
window.TutorDek = (() => {
  const escape = (value) =>
    String(value ?? '').replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  async function request(path, data) {
    let response;
    try {
      response = await fetch(
        '/api/' + path,
        data === undefined
          ? {}
          : {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-TutorDek': '1' },
              body: JSON.stringify(data),
            },
      );
    } catch {
      throw new Error('Server tidak terhubung. Jalankan python server.py dan coba lagi.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Permintaan tidak berhasil.');
    return result;
  }
  let opener;
  function close() {
    document.querySelectorAll('.popup.active').forEach((popup) => {
      popup.classList.remove('active');
      popup.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('popup-active');
    opener?.focus();
  }
  function activate(popup) {
    close();
    opener = document.activeElement;
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('popup-active');
    (popup.querySelector('.close-btn') || popup).focus();
  }
  function modal(title, content) {
    let popup = document.getElementById('servicePopup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'servicePopup';
      popup.className = 'popup';
      popup.innerHTML =
        '<div class="overlay"></div><div class="content11 service-content" role="dialog" aria-modal="true" aria-labelledby="serviceTitle"><button class="close-btn" type="button" aria-label="Tutup">&times;</button><h2 id="serviceTitle"></h2><div class="service-body"></div></div>';
      document.body.append(popup);
      popup.querySelector('.overlay').onclick = close;
      popup.querySelector('.close-btn').onclick = close;
    }
    popup.querySelector('h2').textContent = title;
    popup.querySelector('.service-body').innerHTML = content;
    activate(popup);
    return popup.querySelector('.service-body');
  }
  function status(container, message, error = false) {
    let node = container.querySelector('.service-status');
    if (!node) {
      node = document.createElement('p');
      node.className = 'service-status';
      node.setAttribute('role', 'status');
      container.append(node);
    }
    node.textContent = message;
    node.classList.toggle('error', error);
  }
  function action(element, callback, container = element.parentElement) {
    element.addEventListener(element.tagName === 'FORM' ? 'submit' : 'click', async (event) => {
      event.preventDefault();
      const button =
        element.tagName === 'FORM' ? element.querySelector('[type="submit"]') : element;
      if (button.disabled) return;
      button.disabled = true;
      try {
        await callback(event);
      } catch (error) {
        status(container, error.message, true);
      } finally {
        button.disabled = false;
      }
    });
  }
  async function requireUser() {
    const { user } = await request('me');
    if (!user) {
      const next = encodeURIComponent(
        location.pathname === '/' ? '/landing-page.html' : location.pathname,
      );
      modal(
        'Masuk untuk melanjutkan',
        '<p>Simpan pemesanan dan kemajuan belajar di akunmu.</p><a class="service-button" href="sign-in.html?next=' +
          next +
          '">Masuk</a> <a class="service-button" href="signup.html?next=' +
          next +
          '">Daftar</a>',
      );
      return null;
    }
    return user;
  }
  document.addEventListener('keydown', (event) => {
    const popup = document.querySelector('.popup.active');
    if (!popup) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const items = [
        ...popup.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]'),
      ].filter((item) => item.getClientRects().length && !item.disabled);
      if (!items.length) {
        event.preventDefault();
        return;
      }
      const first = items[0],
        last = items.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first || !popup.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !popup.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  return { request, escape, modal, close, activate, status, action, requireUser };
})();
