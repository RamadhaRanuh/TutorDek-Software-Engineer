import {
  state,
  api,
  esc,
  money,
  when,
  tutor,
  lesson,
  options,
  field,
  empty,
  heading,
  errorBox,
  submit,
  formError,
  refresh,
  toast,
  dialog,
  closeDialog,
  statusName,
} from './core.js';

const grades = { SD: [1, 2, 3, 4, 5, 6], SMP: [7, 8, 9], SMA: [10, 11, 12] };
const names = ['Kebutuhan', 'Tutor & metode', 'Jadwal', 'Tinjau'];

function bookingDetails(b) {
  const t = tutor(b.tutor_id);
  return `<dl class="summary-list"><div><dt>Tutor</dt><dd>${esc(t?.name || b.tutor_id)}</dd></div><div><dt>Pelajaran & materi</dt><dd>${esc(b.subject)} · ${esc(lesson(b.topic)?.title)}</dd></div><div><dt>Jenjang & kelas</dt><dd>${b.level} · Kelas ${b.grade}</dd></div><div><dt>Jadwal · 60 menit</dt><dd>${when(b.start)}</dd></div><div><dt>Metode</dt><dd>${b.mode}${b.address ? ' · ' + esc(b.address) : ''}</dd></div><div><dt>Total</dt><dd>${money(b.total)}${b.discount ? ` <small class="muted">(hemat ${money(b.discount)})</small>` : ''}</dd></div></dl>`;
}

export function bookingPage(preselected) {
  let draft = {
    level: '',
    grade: '',
    subject: '',
    topic: '',
    tutorId: '',
    mode: 'Online',
    address: '',
    date: '',
    hour: '',
    promo: '',
    step: 0,
  };
  try {
    const saved = JSON.parse(sessionStorage.getItem('tutordek-booking'));
    if (saved?.userId === state.user.id) draft = { ...draft, ...saved.draft };
  } catch {
    sessionStorage.removeItem('tutordek-booking');
  }
  const pre = tutor(preselected);
  if (pre) {
    if (draft.tutorId !== pre.id) {
      draft.date = '';
      draft.hour = '';
      draft.step = 0;
    }
    draft.tutorId = pre.id;
    draft.subject = pre.subject;
    draft.level = pre.levels[0];
    if (!grades[draft.level].includes(Number(draft.grade))) draft.grade = '';
    if (!state.catalogue.subjects[draft.subject].includes(draft.topic)) draft.topic = '';
    if (!pre.modes.includes(draft.mode)) draft.mode = 'Online';
  }
  if (preselected === 'auto') draft.tutorId = 'auto';
  let step = Math.max(0, Math.min(3, Number(draft.step) || 0));
  let available = null;
  function save() {
    draft.step = step;
    sessionStorage.setItem('tutordek-booking', JSON.stringify({ userId: state.user.id, draft }));
  }
  function candidates() {
    return state.catalogue.tutors.filter(
      (t) =>
        t.subject === draft.subject &&
        t.levels.includes(draft.level) &&
        t.modes.includes(draft.mode),
    );
  }
  function picked() {
    if (draft.tutorId !== 'auto') return tutor(draft.tutorId);
    return candidates()
      .filter(
        (t) =>
          (!draft.hour || t.slots.includes(Number(draft.hour))) &&
          (!available || available.includes(t.id)),
      )
      .sort((a, b) => b.rating - a.rating || a.price - b.price)[0];
  }
  function sidebar() {
    const t = picked();
    const promo = state.catalogue.promos.find((p) => p.code === draft.promo.trim().toUpperCase());
    const discount = t && promo ? Math.min((t.price * promo.percent) / 100, promo.cap) : 0;
    return `<aside class="card booking-summary"><p class="eyebrow">Rencana belajarmu</p><h2>Satu langkah lagi.</h2><dl><dt>Jenjang</dt><dd>${esc(draft.level || 'Belum dipilih')}${draft.grade ? ' · Kelas ' + esc(draft.grade) : ''}</dd><dt>Materi</dt><dd>${esc(lesson(draft.topic)?.title || 'Belum dipilih')}</dd><dt>Tutor</dt><dd>${draft.tutorId === 'auto' ? 'Pencocokan otomatis' : esc(t?.name || 'Belum dipilih')}</dd><dt>Metode</dt><dd>${draft.mode}</dd><dt>Jadwal</dt><dd>${esc(draft.date || 'Belum dipilih')}${draft.hour !== '' ? ' · ' + esc(draft.hour) + ':00 WIB' : ''}</dd><dt>Perkiraan total</dt><dd>${t ? money(t.price - discount) : 'Pilih tutor terlebih dahulu'}</dd></dl><p class="muted" style="font-size:12px">Sesi 60 menit. Harga dan jadwal diperiksa sebelum pemesanan disimpan. Pembayaran merupakan simulasi.</p></aside>`;
  }
  function stage() {
    if (step === 0)
      return `<h2>Apa yang ingin kamu pelajari?</h2><p class="muted">Pilih jenjang, kelas, dan materi yang ingin kamu pahami.</p><div class="form-stack">${field('Jenjang', `<select name="level" required>${options(['SD', 'SMP', 'SMA'], draft.level, 'Pilih jenjang')}</select>`)}${field('Kelas', `<select name="grade" required>${options(grades[draft.level] || [], draft.grade, 'Pilih kelas')}</select>`)}${field(
        'Mata pelajaran',
        `<select name="subject" required>${options(
          Object.keys(state.catalogue.subjects).filter((s) =>
            state.catalogue.tutors.some((t) => t.subject === s && t.levels.includes(draft.level)),
          ),
          draft.subject,
          'Pilih pelajaran',
        )}</select>`,
      )}${field(
        'Materi',
        `<select name="topic" required>${options(
          (state.catalogue.subjects[draft.subject] || []).map((id) => [id, lesson(id).title]),
          draft.topic,
          'Pilih materi',
        )}</select>`,
      )}</div>`;
    if (step === 1)
      return `<h2>Temukan cara belajar yang nyaman.</h2><p class="muted">Tutor disaring berdasarkan pelajaran dan jenjangmu.</p><div class="form-stack">${field('Metode', `<select name="mode" required>${options(['Online', 'Offline'], draft.mode)}</select>`)}${field('Tutor', `<select name="tutorId" required>${options([['auto', 'Cocokkan otomatis — rating tertinggi yang tersedia'], ...candidates().map((t) => [t.id, `${t.name} · ${money(t.price)}/jam`])], draft.tutorId, 'Pilih tutor')}</select>`)}${draft.mode === 'Offline' ? field('Alamat pertemuan', `<textarea name="address" required minlength="10" maxlength="500" placeholder="Alamat lengkap di wilayah tutor demo (Jakarta)">${esc(draft.address)}</textarea>`) + '<p class="muted">Alamat hanya tersimpan untuk akunmu. Tatap muka tetap membutuhkan tanggal dan waktu.</p>' : '<div class="callout">Sesi online menggunakan ruang catatan dan papan tulis. Panggilan video belum tersedia.</div>'}</div>`;
    if (step === 2) {
      const tutors =
        draft.tutorId === 'auto' ? candidates() : [tutor(draft.tutorId)].filter(Boolean);
      const hours = [...new Set(tutors.flatMap((t) => t.slots))].sort((a, b) => a - b);
      const latest = new Date(state.catalogue.today + 'T00:00:00Z');
      latest.setUTCDate(latest.getUTCDate() + 90);
      return `<h2>Kapan kita mulai?</h2><p class="muted">Semua waktu ditampilkan dalam WIB (UTC+7). Setiap sesi berlangsung satu jam.</p><div class="form-stack">${field('Tanggal sesi', `<input type="date" name="date" required min="${state.catalogue.today}" max="${latest.toISOString().slice(0, 10)}" value="${esc(draft.date)}">`)}${field(
        'Waktu mulai (WIB)',
        `<select name="hour" required>${options(
          hours.map((h) => [h, `${String(h).padStart(2, '0')}:00 – ${h + 1}:00 WIB`]),
          draft.hour,
          'Pilih waktu',
        )}</select>`,
      )}<p class="muted">Jadwal akan diperiksa sebelum kamu melanjutkan. Pemesanan aktif mencegah sesi yang bertabrakan.</p></div>`;
    }
    const t = picked();
    return `<h2>Periksa sebelum menyimpan.</h2><p class="muted">Pemesanan disimpan sebagai menunggu pembayaran. Kamu bisa mengonfirmasi checkout simulasi di dashboard.</p><dl class="summary-list"><div><dt>Kebutuhan</dt><dd>${draft.level} · Kelas ${esc(draft.grade)} · ${esc(draft.subject)}</dd></div><div><dt>Materi</dt><dd>${esc(lesson(draft.topic)?.title)}</dd></div><div><dt>Tutor</dt><dd>${draft.tutorId === 'auto' ? 'Otomatis: ' : ''}${esc(t?.name || 'Akan dicocokkan')}</dd></div><div><dt>Metode</dt><dd>${draft.mode}${draft.address && draft.mode === 'Offline' ? ' · ' + esc(draft.address) : ''}</dd></div><div><dt>Jadwal</dt><dd>${esc(draft.date)} · ${esc(draft.hour)}:00 WIB</dd></div><div><dt>Durasi</dt><dd>60 menit</dd></div></dl><div class="form-stack">${field('Kode promo (opsional)', `<input name="promo" maxlength="30" placeholder="Contoh: BELAJAR20" value="${esc(draft.promo)}">`)}<div class="callout">Tidak perlu nomor kartu atau akun bank. Simulasi ini tidak menagih uang sungguhan.</div></div>`;
  }
  return {
    html:
      heading(
        'Pesan sesi',
        'Buat ruang untuk belajar.',
        'Rencanakan sesi yang sesuai dengan kebutuhanmu.',
      ) + '<div id="wizard"></div>',
    mount(root) {
      const target = root.querySelector('#wizard');
      function draw(focusName) {
        target.innerHTML = `<ol class="steps" aria-label="Tahap pemesanan">${names.map((name, i) => `<li class="${i <= step ? 'active' : ''}" ${i === step ? 'aria-current="step"' : ''}>${i + 1}. ${name}</li>`).join('')}</ol><div class="booking-layout"><form id="booking-form" class="card">${stage()}${errorBox}<div class="wizard-actions"><button type="button" class="button secondary" id="previous">${step ? '← Sebelumnya' : 'Batal'}</button><button type="submit" class="button">${step === 3 ? 'Simpan pemesanan' : 'Lanjutkan →'}</button></div></form>${sidebar()}</div>`;
        const form = target.querySelector('form');
        form.oninput = (event) => {
          const name = event.target.name;
          if (!name) return;
          draft[name] = event.target.value;
          if (name === 'promo') target.querySelector('.booking-summary').outerHTML = sidebar();
          save();
        };
        form.onchange = (event) => {
          const name = event.target.name;
          draft[name] = event.target.value;
          if (name === 'level') {
            draft.grade = '';
            draft.subject = '';
            draft.topic = '';
            draft.tutorId = '';
            draft.hour = '';
          }
          if (name === 'subject') {
            draft.topic = '';
            draft.tutorId = '';
            draft.hour = '';
          }
          if (name === 'mode') {
            draft.address = '';
            if (draft.tutorId !== 'auto' && !candidates().some((t) => t.id === draft.tutorId))
              draft.tutorId = '';
            draft.hour = '';
          }
          if (name === 'tutorId') draft.hour = '';
          available = null;
          save();
          if (['level', 'subject', 'mode', 'tutorId'].includes(name)) draw(name);
        };
        form.querySelector('#previous').onclick = () => {
          if (step > 0) {
            step--;
            save();
            draw();
          } else location.hash = '/tutors';
        };
        form.onsubmit = (event) => {
          event.preventDefault();
          submit(form, async () => {
            if (step === 2) {
              const result = await api('availability', {
                date: draft.date,
                hour: Number(draft.hour),
              });
              available = result.available;
              if (!picked() || !available.includes(picked().id))
                throw new Error('Tutor tidak tersedia pada jadwal ini. Pilih waktu lain.');
            }
            if (step < 3) {
              step++;
              save();
              draw();
              target.querySelector('h2').setAttribute('tabindex', '-1');
              target.querySelector('h2').focus();
            } else {
              await api('bookings', {
                ...draft,
                grade: Number(draft.grade),
                hour: Number(draft.hour),
              });
              sessionStorage.removeItem('tutordek-booking');
              toast('Pemesanan tersimpan. Lanjutkan checkout simulasi di dashboard.');
              location.hash = '/dashboard';
            }
          });
        };
        if (focusName) form.elements.namedItem(focusName)?.focus();
      }
      draw();
      save();
    },
  };
}

export async function dashboardPage() {
  const data = await refresh();
  const upcoming = data.bookings.filter(
    (b) => ['pending', 'confirmed'].includes(b.status) && b.end > data.now,
  );
  return {
    html:
      heading(
        'Dashboard',
        `Halo, ${state.user.name.split(' ')[0]}.`,
        'Satu tempat untuk sesi, materi, dan kemajuan belajarmu.',
        '<a class="button" href="#/tutors">+ Pesan sesi baru</a>',
      ) +
      `<div class="stats"><div class="stat"><strong>${upcoming.length}</strong><span>Sesi mendatang</span></div><div class="stat"><strong>${data.completions.length}</strong><span>Materi selesai</span></div><div class="stat"><strong>${data.attempts.length}</strong><span>Latihan dikerjakan</span></div></div><div class="row" style="margin-bottom:28px"><a class="button secondary" href="#/progress">Lihat progres</a><a class="button secondary" href="#/messages">Buka pesan</a><a class="button secondary" href="#/library">Lanjut belajar</a></div><h2>Sesi belajarmu</h2>${data.bookings.length ? data.bookings.map((b) => `<article class="card booking-card"><span class="chip ${b.status === 'confirmed' ? 'green' : ''}">${statusName[b.status]}</span><h3>${esc(tutor(b.tutor_id)?.name)}</h3>${bookingDetails(b)}<div class="row">${b.status === 'pending' && b.start > data.now ? `<button class="button small" data-pay="${b.id}">Checkout simulasi</button>` : ''}${['confirmed', 'completed'].includes(b.status) ? `<a class="button secondary small" href="#/room/${b.id}">Buka ruang sesi</a>` : ''}${['pending', 'confirmed'].includes(b.status) ? `<button class="button secondary small" data-cancel="${b.id}">Batalkan</button>` : ''}${b.status === 'confirmed' && b.end <= data.now ? `<button class="button small" data-complete="${b.id}">Tandai sesi selesai</button>` : ''}${b.status === 'completed' && !b.reviewed ? `<button class="button small" data-review="${b.id}">Tulis ulasan</button>` : ''}${b.reviewed ? '<span class="muted">Ulasan tersimpan</span>' : ''}</div>${b.status === 'pending' && b.start <= data.now ? '<p class="muted">Jadwal sudah lewat. Batalkan dan buat pemesanan baru.</p>' : ''}</article>`).join('') : empty('Belum ada sesi.', 'Temukan tutor yang cocok, lalu rencanakan langkah pertamamu.', '/tutors', 'Temukan tutor')}`,
    mount(root) {
      const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
      root.querySelectorAll('[data-pay]').forEach(
        (button) =>
          (button.onclick = () => {
            const b = data.bookings.find((x) => x.id === button.dataset.pay);
            dialog(
              'Checkout simulasi',
              `<div class="callout">Simulasi untuk proyek ini. Tidak ada uang yang ditagih dan tidak ada detail pembayaran yang diminta.</div><p>Total: <strong>${money(b.total)}</strong></p><form class="form-stack">${field('Metode simulasi', `<select name="method" required>${options(['Demo e-wallet', 'Demo bank'], '')}</select>`)}${errorBox}<button type="submit" class="button">Konfirmasi pembayaran demo</button></form>`,
              (target) => {
                const form = target.querySelector('form');
                form.onsubmit = (event) => {
                  event.preventDefault();
                  submit(form, async () => {
                    await api(`bookings/${b.id}/pay`, { method: form.elements.method.value });
                    closeDialog();
                    toast('Pembayaran demo dikonfirmasi.');
                    rerender();
                  });
                };
              },
            );
          }),
      );
      root.querySelectorAll('[data-cancel]').forEach(
        (button) =>
          (button.onclick = () =>
            dialog(
              'Batalkan pemesanan?',
              `<p>Jadwal akan dilepas dan pemesanan ditandai dibatalkan. Pembayaran demo tidak memproses pengembalian uang sungguhan.</p><form class="form-stack">${errorBox}<div class="row"><button type="submit" class="button danger">Ya, batalkan</button><button type="button" class="button secondary" id="keep-booking">Pertahankan</button></div></form>`,
              (target) => {
                const form = target.querySelector('form');
                target.querySelector('#keep-booking').onclick = closeDialog;
                form.onsubmit = (event) => {
                  event.preventDefault();
                  submit(form, async () => {
                    await api(`bookings/${button.dataset.cancel}/cancel`, {});
                    closeDialog();
                    toast('Pemesanan dibatalkan.');
                    rerender();
                  });
                };
              },
            )),
      );
      root.querySelectorAll('[data-complete]').forEach(
        (button) =>
          (button.onclick = async () => {
            button.disabled = true;
            try {
              await api(`bookings/${button.dataset.complete}/complete`, {});
              toast('Sesi selesai. Terima kasih sudah belajar!');
              rerender();
            } catch (error) {
              toast(error.message);
              button.disabled = false;
            }
          }),
      );
      root.querySelectorAll('[data-review]').forEach(
        (button) =>
          (button.onclick = () =>
            dialog(
              'Bagikan pengalamanmu',
              `<form class="form-stack">${field(
                'Rating',
                `<select name="rating" required>${options(
                  [1, 2, 3, 4, 5].map((n) => [n, `${n} bintang`]),
                  '',
                )}</select>`,
              )}${field('Ulasan', '<textarea name="body" required minlength="5" maxlength="2000"></textarea>')}${errorBox}<button type="submit" class="button">Simpan ulasan</button></form>`,
              (target) => {
                const form = target.querySelector('form');
                form.onsubmit = (event) => {
                  event.preventDefault();
                  submit(form, async () => {
                    await api(`bookings/${button.dataset.review}/review`, {
                      rating: Number(form.elements.rating.value),
                      body: form.elements.body.value,
                    });
                    closeDialog();
                    toast('Ulasan tersimpan.');
                    rerender();
                  });
                };
              },
            )),
      );
    },
  };
}

export async function roomPage(id) {
  const data = await refresh();
  const b = data.bookings.find((x) => x.id === id);
  if (!b || !['confirmed', 'completed'].includes(b.status))
    return {
      html: empty(
        'Ruang sesi belum tersedia.',
        'Konfirmasikan pembayaran demo untuk membuka ruang sesi milikmu.',
        '/dashboard',
        'Ke dashboard',
      ),
    };
  return {
    html:
      heading(
        'Ruang sesi',
        `Belajar ${b.subject}.`,
        'Ruang mandiri untuk catatan dan papan tulis. Panggilan video belum tersedia.',
        '<a class="button secondary" href="#/dashboard">← Dashboard</a>',
      ) +
      `<div class="card" style="margin-bottom:25px">${bookingDetails(b)}</div><div class="grid two"><section class="card"><h2>Catatan sesi</h2><p class="muted">Simpan ide, pertanyaan, dan hal yang sudah kamu pahami.</p><form id="notes-form" class="form-stack">${field('Catatan pribadi', `<textarea name="notes" maxlength="10000" rows="10">${esc(b.notes)}</textarea>`)}${errorBox}<button class="button" type="submit">Simpan catatan</button></form><p style="margin-top:20px"><a href="#/messages/${b.tutor_id}">Kirim pesan ke tutor →</a></p></section><section class="card"><h2>Papan tulis</h2><p class="muted">Gambar dengan mouse atau sentuhan. Unduh untuk menyimpan hasil; gambar akan hilang saat kamu meninggalkan halaman.</p><canvas id="whiteboard" width="700" height="420" aria-label="Papan gambar; unduhan tersedia melalui tombol di bawah"></canvas><div class="row"><button class="button secondary small" id="clear-board">Hapus gambar</button><button class="button small" id="save-board">Unduh PNG</button></div></section></div>`,
    mount(root) {
      const form = root.querySelector('#notes-form');
      form.onsubmit = (event) => {
        event.preventDefault();
        submit(form, async () => {
          await api(`bookings/${id}/notes`, { notes: form.elements.notes.value });
          toast('Catatan disimpan.');
        });
      };
      const canvas = root.querySelector('canvas'),
        ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#054a91';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      let drawing = false;
      const position = (event) => {
        const r = canvas.getBoundingClientRect();
        return [
          ((event.clientX - r.left) * canvas.width) / r.width,
          ((event.clientY - r.top) * canvas.height) / r.height,
        ];
      };
      canvas.onpointerdown = (event) => {
        drawing = true;
        canvas.setPointerCapture(event.pointerId);
        ctx.beginPath();
        ctx.moveTo(...position(event));
      };
      canvas.onpointermove = (event) => {
        if (drawing) {
          ctx.lineTo(...position(event));
          ctx.stroke();
        }
      };
      canvas.onpointerup = canvas.onpointercancel = () => {
        drawing = false;
      };
      root.querySelector('#clear-board').onclick = () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      };
      root.querySelector('#save-board').onclick = () => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'tutordek-papan-tulis.png';
        link.click();
      };
    },
  };
}
