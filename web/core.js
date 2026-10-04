export const state = { user: null, catalogue: null, dashboard: null };
export const esc = (value = '') =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const money = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
export const when = (value) =>
  new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value * 1000)) + ' WIB';
export const tutor = (id) => state.catalogue.tutors.find((t) => t.id === id);
export const lesson = (id) => state.catalogue.lessons.find((l) => l.id === id);
export const statusName = {
  pending: 'Menunggu pembayaran',
  confirmed: 'Terkonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};
export const options = (values, selected, empty = 'Pilih…') =>
  `<option value="">${esc(empty)}</option>` +
  values
    .map((v) => {
      const [value, label] = Array.isArray(v) ? v : [v, v];
      return `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(label)}</option>`;
    })
    .join('');
let fieldId = 0;
export const field = (label, html) => {
  const id = `field-${++fieldId}`;
  const control = html.replace(/<(input|select|textarea)\b/, `<$1 id="${id}"`);
  return `<div class="field"><label for="${id}">${esc(label)}</label>${control}</div>`;
};
export const empty = (title, body, link = '', label = 'Mulai belajar') =>
  `<div class="empty"><span class="empty-icon" aria-hidden="true">✦</span><h2>${esc(title)}</h2><p>${esc(body)}</p>${link ? `<a class="button" href="#${esc(link)}">${esc(label)}</a>` : ''}</div>`;
export const heading = (eyebrow, title, body, action = '') =>
  `<div class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p class="muted">${esc(body)}</p></div>${action}</div>`;

export async function api(path, data) {
  const response = await fetch('/api/' + path, {
    credentials: 'same-origin',
    ...(data === undefined
      ? {}
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-TutorDek': '1' },
          body: JSON.stringify(data),
        }),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || 'Permintaan gagal. Silakan coba lagi.');
    error.status = response.status;
    throw error;
  }
  return result;
}

export async function refresh() {
  state.dashboard = await api('dashboard');
  return state.dashboard;
}
export function toast(message) {
  const target = document.querySelector('#toast');
  target.textContent = message;
  target.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    target.hidden = true;
  }, 5000);
}
export function formError(form, message) {
  const target = form.querySelector('.form-error');
  target.textContent = message;
  target.hidden = false;
  target.focus();
}
export async function submit(form, operation) {
  const button = form.querySelector('[type="submit"]');
  const error = form.querySelector('.form-error');
  if (error) {
    error.hidden = true;
    error.textContent = '';
  }
  button.disabled = true;
  try {
    await operation();
  } catch (failure) {
    formError(form, failure.message);
  } finally {
    button.disabled = false;
  }
}
export const errorBox = '<p class="form-error" role="alert" tabindex="-1" hidden></p>';
export function dialog(title, content, onReady) {
  const target = document.querySelector('#dialog');
  target.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" id="close-dialog" aria-label="Tutup">×</button></div>${content}`;
  target.querySelector('#close-dialog').onclick = () => target.close();
  target.onkeydown = (event) => {
    if (event.key !== 'Tab') return;
    const controls = [
      ...target.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]'),
    ].filter((element) => !element.disabled && element.getClientRects().length);
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  target.showModal();
  onReady?.(target);
}
export function closeDialog() {
  document.querySelector('#dialog').close();
}
export function download(name, content, type = 'text/html;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function requireUser(route) {
  if (state.user) return true;
  sessionStorage.setItem('tutordek-return', route);
  location.hash = '/login';
  return false;
}
