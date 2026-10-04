import {
  state,
  api,
  esc,
  money,
  when,
  tutor,
  options,
  field,
  empty,
  heading,
  errorBox,
  submit,
  refresh,
  toast,
  requireUser,
} from './core.js';
import { bookingPage, dashboardPage, roomPage } from './booking.js';
import {
  libraryPage,
  lessonPage,
  packagesPage,
  practicePage,
  quizPage,
  progressPage,
  assistantPage,
} from './learning.js';
import { messagesPage, forumPage, threadPage, reviewsPage } from './community.js';

const main = document.querySelector('#main');
let revision = 0;
let firstRender = true;
let logoutPending = null;
const protectedRoutes = new Set(['book', 'dashboard', 'room', 'messages', 'progress', 'assistant']);

function shell() {
  const path = location.hash.slice(1) || '/';
  const links = [
    ['/tutors', 'Cari tutor'],
    ['/library', 'Materi belajar'],
    ['/practice', 'BrainBoost'],
    ['/forum', 'Komunitas'],
  ];
  document.querySelector('#header').innerHTML =
    `<nav class="nav" aria-label="Navigasi utama"><a class="brand" href="#/" aria-label="TutorDek, beranda"><span class="brand-mark" aria-hidden="true">t</span><span>Tutor<em>Dek</em><span aria-hidden="true">.</span></span></a><button class="icon-button menu-toggle" aria-label="Buka menu" aria-expanded="false" aria-controls="nav-links">☰</button><div class="nav-links" id="nav-links">${links.map(([route, label]) => `<a href="#${route}" ${path.startsWith(route) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}<a href="#/assistant" ${path === '/assistant' ? 'aria-current="page"' : ''}>Asisten</a></div><div class="nav-actions">${state.user ? `<a class="button small" href="#/dashboard">Dashboard</a><button class="button secondary small" data-logout>Keluar</button>` : '<a class="button secondary small" href="#/login">Masuk</a><a class="button small" href="#/signup">Daftar</a>'}</div></nav>`;
  const menu = document.querySelector('.menu-toggle');
  menu.onclick = () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    document.querySelector('#nav-links').classList.toggle('open', open);
  };
  document.querySelector('[data-logout]')?.addEventListener('click', async (event) => {
    event.currentTarget.disabled = true;
    const startedAt = location.hash;
    const button = event.currentTarget;
    try {
      logoutPending = api('logout', {});
      await logoutPending;
      state.user = null;
      state.dashboard = null;
      sessionStorage.removeItem('tutordek-booking');
      sessionStorage.removeItem('tutordek-return');
      toast('Kamu sudah keluar.');
      if (location.hash !== startedAt) {
        shell();
        const path = location.hash.slice(1) || '/';
        if (protectedRoutes.has(path.split('/')[1])) requireUser(path);
      } else if (location.hash === '#/') render();
      else location.hash = '/';
    } catch (error) {
      toast(error.message);
      button.disabled = false;
    } finally {
      logoutPending = null;
    }
  });
  document.querySelector('#footer').innerHTML =
    `<div class="footer-inner"><div><a class="brand" href="#/" aria-label="TutorDek, beranda">Tutor<em>Dek.</em></a><p>Langkah kecil hari ini, kemungkinan besar esok hari.</p><p>Aplikasi demo · Tutor dan checkout simulasi</p></div><nav class="row" aria-label="Tautan lainnya"><a href="#/packages">Paket belajar</a><a href="#/promos">Promo</a><a href="#/progress">Progres</a><a href="#/messages">Pesan</a><a href="#/reviews">Ulasan</a><a href="#/">Beranda</a></nav></div>`;
}

export function tutorCard(t) {
  return `<article class="card tutor-card"><div class="portrait"><img src="/assets/${esc(t.image)}" alt="" loading="lazy"><span class="chip">★ ${t.rating} · profil demo</span></div><div class="tutor-info"><h3><a href="#/tutor/${t.id}">${esc(t.name)}</a></h3><p class="muted">${esc(t.subject)} · ${t.levels.join(' / ')}</p><small>${t.years} tahun pengalaman · ${t.modes.join(' & ')}</small><div class="price-row"><div><strong>${money(t.price)}</strong><small> / jam</small></div><a class="button secondary small" href="#/tutor/${t.id}">Lihat profil</a></div></div></article>`;
}

function homePage() {
  const features = [
    [
      '/tutors',
      '↗',
      'Tutor yang sesuai',
      'Pilih bidang, jenjang, dan waktu yang cocok dengan kebutuhanmu.',
    ],
    [
      '/library',
      '▤',
      'Materi yang mudah dicerna',
      'Mulai dari penjelasan singkat, lalu uji pemahamanmu.',
    ],
    [
      '/progress',
      '✓',
      'Kemajuan yang terlihat',
      'Simpan hasil latihan dan rayakan setiap langkah kecil.',
    ],
  ];
  return {
    html: `<section class="hero"><div class="hero-copy"><p class="eyebrow">Belajar dengan caramu</p><h1>Temukan ritmemu.<br><span>Raih potensi</span><br>terbaikmu.</h1><p class="muted">Ada teman untuk setiap langkah belajarmu. Temukan tutor yang pas, pahami materi, dan tumbuh lebih percaya diri bersama TutorDek.</p><div class="row"><a class="button" href="#/tutors">Temukan tutormu <span aria-hidden="true">↗</span></a><a class="button secondary" href="#/library">Jelajahi materi</a></div><span class="muted">SD, SMP, hingga SMA · Online & tatap muka</span></div><div class="hero-art"><img src="/assets/image@2x.png" alt="Pelajar berdiskusi dan belajar bersama" fetchpriority="high"><div class="float-card one"><strong>Belajar, lebih dekat.</strong>Satu langkah, satu pemahaman.</div><div class="float-card two"><strong>✦ Ruang untuk tumbuh</strong>Materi + latihan + tutor</div></div></section><div class="trust-row"><div><strong>3 jenjang</strong>Untuk setiap tahap belajar</div><div><strong>7 bidang</strong>Sains, bahasa, dan matematika</div><div><strong>Fleksibel</strong>Jadwal dalam waktu WIB</div></div><section class="section"><div class="section-heading"><div><p class="eyebrow">Lebih dari sekadar les</p><h2>Semua yang kamu butuhkan untuk maju.</h2><p class="muted">Dari rasa ingin tahu hingga akhirnya mengerti.</p></div></div><div class="grid">${features.map(([url, icon, title, copy]) => `<a class="card card-link" href="#${url}"><span class="card-icon" aria-hidden="true">${icon}</span><h3>${title}</h3><p class="muted">${copy}</p></a>`).join('')}</div></section><section class="section"><div class="section-heading"><div><p class="eyebrow">Kenali teman belajarmu</p><h2>Temukan kecocokan, mulai percakapan.</h2><p class="muted">Profil tutor merupakan data demonstrasi proyek.</p></div><a href="#/tutors">Lihat semua tutor →</a></div><div class="grid">${state.catalogue.tutors.slice(0, 3).map(tutorCard).join('')}</div></section><section class="section"><div class="cta-band"><div><p class="eyebrow" style="color:#dce9f6">Mulai dari yang sederhana</p><h2>Sepuluh menit bisa jadi awal yang baik.</h2><p>Baca satu materi. Kerjakan dua soal. Lihat seberapa jauh kamu melangkah.</p></div><a class="button" href="#/practice">Coba BrainBoost →</a></div></section><section class="section faq"><p class="eyebrow">Pertanyaan yang sering ditanyakan</p><h2>Kenalan dulu dengan TutorDek.</h2>${[
      [
        'Bagaimana cara memesan tutor?',
        'Daftar atau masuk, pilih tutor dan materi, lalu tentukan jadwal. Tinjau detail sebelum menyimpan pemesanan. Checkout saat ini adalah simulasi tanpa uang sungguhan.',
      ],
      [
        'Apakah materi bisa dipelajari gratis?',
        'Ya. Semua materi contoh asli TutorDek, latihan, dan paket mandiri bisa diakses gratis. Masuk untuk menyimpan progresmu.',
      ],
      [
        'Apa yang tersedia di ruang sesi?',
        'Detail pemesanan, catatan tersimpan, dan papan tulis dengan unduhan PNG. Ruang ini belum menyediakan panggilan video.',
      ],
      [
        'Bagaimana asisten belajar bekerja?',
        'Asisten mencari penjelasan dari materi TutorDek dan menyertakan sumber. Asisten ini tidak menggunakan model AI dan tidak menggantikan tutor.',
      ],
      [
        'Bagaimana jika lupa kata sandi?',
        'Pemulihan lewat email belum tersedia pada aplikasi lokal ini. Simpan kata sandimu dengan aman. Tidak ada tautan pemulihan palsu atau pengiriman email otomatis.',
      ],
    ]
      .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`)
      .join('')}</section>`,
  };
}

function authPage(signup) {
  const title = signup ? 'Mulai perjalanan belajarmu.' : 'Senang melihatmu kembali.';
  return {
    html: `<div class="auth-layout"><aside class="auth-art"><img src="/assets/image@2x.png" alt=""><h2>Setiap langkah<br>punya arti.</h2><p class="muted">Temukan tutor, bangun kebiasaan, dan simpan kemajuanmu di satu tempat.</p></aside><section><p class="eyebrow">${signup ? 'Daftar TutorDek' : 'Masuk TutorDek'}</p><h1>${title}</h1><p class="muted">${signup ? 'Buat akun untuk menyimpan sesi dan progres belajar.' : 'Lanjutkan dari tempat kamu terakhir belajar.'}</p><form id="auth-form" class="form-stack">${signup ? field('Nama lengkap', '<input name="name" autocomplete="name" required minlength="2" maxlength="80" placeholder="Nama yang ingin kamu gunakan">') : ''}${field('Email', '<input type="email" name="email" autocomplete="email" required maxlength="254" placeholder="nama@email.com">')}${`<div class="field"><label for="password">Kata sandi</label><span class="password-wrap"><input type="password" name="password" id="password" autocomplete="${signup ? 'new-password' : 'current-password'}" required minlength="${signup ? 10 : 1}" maxlength="128"><button type="button" id="show-password" aria-controls="password" aria-pressed="false">Tampilkan</button></span></div>`}${signup ? '<small class="muted">Gunakan setidaknya 10 karakter untuk melindungi akunmu.</small>' : ''}${errorBox}<button class="button" type="submit">${signup ? 'Buat akun' : 'Masuk'}</button></form><p class="muted" style="margin-top:22px">${signup ? 'Sudah punya akun? <a href="#/login">Masuk</a>' : 'Belum punya akun? <a href="#/signup">Daftar sekarang</a>'}</p></section></div>`,
    mount(root) {
      const form = root.querySelector('form');
      root.querySelector('#show-password').onclick = (event) => {
        const input = root.querySelector('#password');
        const visible = input.type === 'password';
        input.type = visible ? 'text' : 'password';
        event.currentTarget.textContent = visible ? 'Sembunyikan' : 'Tampilkan';
        event.currentTarget.setAttribute('aria-pressed', String(visible));
      };
      form.onsubmit = (event) => {
        event.preventDefault();
        submit(form, async () => {
          if (logoutPending) await logoutPending;
          const result = await api(
            signup ? 'signup' : 'login',
            Object.fromEntries(new FormData(form)),
          );
          state.user = result.user;
          const returnTo = sessionStorage.getItem('tutordek-return');
          sessionStorage.removeItem('tutordek-return');
          toast(signup ? 'Akun berhasil dibuat. Selamat datang!' : 'Berhasil masuk.');
          location.hash = returnTo && /^\/[a-zA-Z0-9/-]*$/.test(returnTo) ? returnTo : '/dashboard';
        });
      };
    },
  };
}

function tutorsPage() {
  return {
    html:
      heading(
        'Teman belajar',
        'Tutor yang pas untukmu.',
        'Saring sesuai kebutuhanmu. Seluruh profil merupakan data demo, bukan ketersediaan tutor sungguhan.',
        '<a class="button secondary" href="#/book/auto">Cocokkan otomatis</a>',
      ) +
      `<form class="filters" id="tutor-filters">${field('Cari nama', '<input name="search" type="search" placeholder="Nama tutor…">')}${field('Mata pelajaran', `<select name="subject">${options(Object.keys(state.catalogue.subjects), '', 'Semua pelajaran')}</select>`)}${field('Jenjang', `<select name="level">${options(['SD', 'SMP', 'SMA'], '', 'Semua jenjang')}</select>`)}${field('Metode', `<select name="mode">${options(['Online', 'Offline'], '', 'Semua metode')}</select>`)}${field(
        'Harga maksimal / jam',
        `<select name="maxPrice">${options(
          [
            [70000, 'Rp70.000'],
            [85000, 'Rp85.000'],
            [100000, 'Rp100.000'],
          ],
          '',
          'Semua harga',
        )}</select>`,
      )}${field(
        'Rating minimal',
        `<select name="minRating">${options(
          [
            [4.5, '4,5'],
            [4.8, '4,8'],
          ],
          '',
          'Semua rating',
        )}</select>`,
      )}${field('Tanggal (opsional)', `<input type="date" name="date" min="${state.catalogue.today}">`)}${field(
        'Waktu WIB (opsional)',
        `<select name="hour">${options(
          Array.from({ length: 13 }, (_, i) => [i + 8, `${i + 8}:00`]),
          '',
          'Semua waktu',
        )}</select>`,
      )}</form><p class="muted" id="filter-status" role="status"></p><div class="grid" id="tutor-results">${state.catalogue.tutors.map(tutorCard).join('')}</div>`,
    mount(root) {
      const form = root.querySelector('form');
      const results = root.querySelector('#tutor-results');
      const status = root.querySelector('#filter-status');
      let sequence = 0;
      async function filter() {
        const current = ++sequence;
        const f = Object.fromEntries(new FormData(form));
        let available = null;
        try {
          if (f.date && f.hour)
            available = (await api('availability', { date: f.date, hour: Number(f.hour) }))
              .available;
          if (current !== sequence) return;
          const matches = state.catalogue.tutors.filter(
            (t) =>
              (!f.search || t.name.toLowerCase().includes(f.search.trim().toLowerCase())) &&
              (!f.subject || t.subject === f.subject) &&
              (!f.level || t.levels.includes(f.level)) &&
              (!f.mode || t.modes.includes(f.mode)) &&
              (!f.maxPrice || t.price <= Number(f.maxPrice)) &&
              (!f.minRating || t.rating >= Number(f.minRating)) &&
              (!available || available.includes(t.id)),
          );
          status.textContent =
            `${matches.length} tutor ditemukan.` +
            (Boolean(f.date) !== Boolean(f.hour)
              ? ' Pilih tanggal dan waktu untuk memeriksa jadwal.'
              : '');
          results.innerHTML = matches.length
            ? matches.map(tutorCard).join('')
            : empty(
                'Belum menemukan kecocokan.',
                'Coba ubah pelajaran, harga, atau jadwal pencarianmu.',
              );
        } catch (error) {
          if (current === sequence) {
            status.textContent = error.message;
            results.innerHTML = empty(
              'Jadwal belum dapat diperiksa.',
              'Ubah tanggal/waktu lalu coba kembali.',
            );
          }
        }
      }
      form.onsubmit = (event) => {
        event.preventDefault();
        filter();
      };
      form.oninput = filter;
      filter();
    },
  };
}

function profilePage(id) {
  const t = tutor(id);
  if (!t)
    return {
      html: empty(
        'Tutor tidak ditemukan.',
        'Kembali ke daftar untuk menemukan teman belajar.',
        '/tutors',
        'Cari tutor',
      ),
    };
  return {
    html: `<p><a href="#/tutors">← Semua tutor</a></p><div class="profile"><div><div class="profile-photo"><img src="/assets/${t.image}" alt=""></div><div class="callout" style="margin-top:20px">Profil demonstrasi. Rating dan pengalaman berasal dari katalog contoh proyek.</div></div><section><p class="eyebrow">${esc(t.subject)} · ${t.levels.join(' / ')}</p><h1>${esc(t.name)}</h1><p class="muted">★ ${t.rating} rating demo · ${t.years} tahun pengalaman demo</p><h2>Belajar dimulai dari rasa nyaman.</h2><p>Pahami ${esc(t.subject.toLowerCase())} dengan penjelasan bertahap, latihan terarah, dan ruang untuk bertanya.</p><div class="grid two"><div class="card"><h3>Latar belakang</h3><p class="muted">${esc(t.qualification)}<br>Lokasi demo: ${t.city}</p></div><div class="card"><h3>Metode belajar</h3><p class="muted">${t.modes.join(' & ')}<br>Sesi 60 menit · WIB</p></div></div><h3 style="margin-top:25px">Jam sesi yang ditawarkan</h3><div class="row">${t.slots.map((h) => `<span class="chip">${h}:00 WIB</span>`).join('')}</div><p class="muted" style="margin-top:12px">Ketersediaan setiap tanggal diperiksa saat pemesanan.</p><div class="row" style="margin-top:25px"><strong>${money(t.price)} / jam</strong><a class="button" href="#/book/${t.id}">Pesan sesi</a><a class="button secondary" href="#/messages/${t.id}">Kirim pesan</a></div></section></div>`,
  };
}

function promosPage() {
  return {
    html:
      heading(
        'Sedikit semangat tambahan',
        'Belajar lebih ringan.',
        'Kode ini berlaku pada checkout simulasi. Tidak ada uang sungguhan yang diproses.',
      ) +
      `<div class="grid two">${state.catalogue.promos.map((p) => `<article class="card promo-card"><p class="eyebrow">Promo demo</p><h2>Hemat ${p.percent}%</h2><p>${esc(p.description)}</p><code class="promo-code">${p.code}</code><p class="muted">Maksimal ${money(p.cap)} per sesi. Berlaku untuk semua tutor demo; satu kode per pemesanan. Potongan otomatis diterapkan saat pemesanan.</p><div class="row"><button class="button secondary" data-copy="${p.code}">Salin kode</button><a class="button" href="#/tutors">Pilih tutor →</a></div></article>`).join('')}</div>`,
    mount(root) {
      root.querySelectorAll('[data-copy]').forEach(
        (button) =>
          (button.onclick = async () => {
            try {
              await navigator.clipboard.writeText(button.dataset.copy);
              toast('Kode promo disalin.');
            } catch {
              toast('Kode: ' + button.dataset.copy);
            }
          }),
      );
    },
  };
}

async function build(path) {
  const parts = path.split('/').filter(Boolean);
  const [route, id] = parts;
  if (protectedRoutes.has(route) && !requireUser(path)) return null;
  switch (route) {
    case undefined:
      return homePage();
    case 'signup':
      return authPage(true);
    case 'login':
      return authPage(false);
    case 'tutors':
      return tutorsPage();
    case 'tutor':
      return profilePage(id);
    case 'book':
      return bookingPage(id);
    case 'dashboard':
      return dashboardPage();
    case 'room':
      return roomPage(id);
    case 'library':
      return libraryPage();
    case 'lesson':
      return lessonPage(id);
    case 'packages':
      return packagesPage();
    case 'practice':
      return practicePage();
    case 'quiz':
      return quizPage(id);
    case 'progress':
      return progressPage();
    case 'assistant':
      return assistantPage();
    case 'messages':
      return messagesPage(id);
    case 'forum':
      return forumPage();
    case 'thread':
      return threadPage(id);
    case 'reviews':
      return reviewsPage();
    case 'promos':
      return promosPage();
    default:
      return {
        html: empty(
          'Halaman tidak ditemukan.',
          'Halaman yang kamu cari tidak tersedia.',
          '/',
          'Kembali ke beranda',
        ),
      };
  }
}

async function render() {
  const current = ++revision;
  const path = location.hash.slice(1) || '/';
  document.querySelector('#dialog').close();
  shell();
  main.innerHTML = '<div class="loading" role="status">Menyiapkan ruang belajarmu…</div>';
  try {
    if (!state.catalogue) state.catalogue = await api('catalogue');
    const result = await build(path);
    if (!result || current !== revision) return;
    main.innerHTML = result.html;
    main.classList.remove('route-enter');
    requestAnimationFrame(() => main.classList.add('route-enter'));
    result.mount?.(main);
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${main.querySelector('h1')?.textContent || 'Belajar'} · TutorDek`;
  } catch (error) {
    if (current !== revision) return;
    if (error.status === 401) {
      state.user = null;
      state.dashboard = null;
      requireUser(path);
      return;
    }
    main.innerHTML =
      empty('Ada kendala saat memuat.', error.message) +
      '<p style="text-align:center"><button class="button" id="retry">Coba lagi</button></p>';
    main.querySelector('#retry').onclick = render;
  }
}
window.addEventListener('hashchange', render);
document.querySelector('.skip-link').onclick = (event) => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
};
try {
  state.user = (await api('me')).user;
} catch {
  /* The route error state offers a retry if the server is unreachable. */
}
render();
