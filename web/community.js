import {
  state,
  api,
  esc,
  when,
  tutor,
  options,
  field,
  empty,
  heading,
  errorBox,
  submit,
  toast,
  requireUser,
} from './core.js';

export async function messagesPage(selected) {
  const messages = await api('messages');
  const initial = tutor(selected)?.id || messages.at(-1)?.tutor_id || state.catalogue.tutors[0].id;
  return {
    html:
      heading(
        'Pesan',
        'Mulai percakapan yang berarti.',
        'Kirim dan simpan pertanyaan untuk tutor yang kamu pilih.',
      ) +
      `<div class="callout">Pesan disimpan sebagai pesan keluar. Profil tutor adalah demo; tidak ada balasan otomatis atau tutor yang sedang online.</div><div class="messages-layout"><section class="card"><h2>Tulis pesan</h2><form id="message-form" class="form-stack">${field(
        'Tutor tujuan',
        `<select name="tutorId" required>${options(
          state.catalogue.tutors.map((t) => [t.id, t.name]),
          initial,
        )}</select>`,
      )}${field('Pesan', '<textarea name="body" required maxlength="2000" placeholder="Ceritakan topik atau pertanyaanmu…"></textarea>')}${errorBox}<button class="button" type="submit">Simpan pesan keluar</button></form></section><section><h2>Riwayat pesan keluar</h2><div id="message-history">${messages.length ? messages.map(messageCard).join('') : empty('Belum ada pesan.', 'Tuliskan pertanyaan untuk mempersiapkan sesi belajarmu.')}</div></section></div>`,
    mount(root) {
      const form = root.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        submit(form, async () => {
          await api('messages', Object.fromEntries(new FormData(form)));
          const next = await api('messages');
          root.querySelector('#message-history').innerHTML = next.map(messageCard).join('');
          form.elements.body.value = '';
          toast('Pesan keluar disimpan.');
        });
      };
    },
  };
}
function messageCard(m) {
  return `<article class="card message-card"><span class="chip">Pesan keluar</span><h3>Untuk ${esc(tutor(m.tutor_id)?.name)}</h3><p class="prewrap">${esc(m.body)}</p><small class="muted">${when(m.created)}</small></article>`;
}
function postCard(p) {
  return `<article class="card forum-card"><div class="row between"><span class="chip">${esc(p.subject)}</span><small class="muted">${p.replies} balasan</small></div><h2><a href="#/thread/${p.id}">${esc(p.title)}</a></h2><p class="muted prewrap">${esc(p.body.slice(0, 200))}${p.body.length > 200 ? '…' : ''}</p><small class="muted">${esc(p.name)} · ${when(p.created)}</small></article>`;
}

export async function forumPage() {
  const posts = await api('posts');
  return {
    html:
      heading(
        'Komunitas belajar',
        'Belajar lebih baik, bersama.',
        'Tanyakan konsep, bagikan cara belajar, dan bantu teman memahami.',
      ) +
      `<div class="forum-layout"><section><form class="filters" id="forum-filters">${field('Cari diskusi', '<input type="search" name="search" placeholder="Cari pertanyaan…">')}${field('Pelajaran', `<select name="subject">${options(Object.keys(state.catalogue.subjects), '', 'Semua pelajaran')}</select>`)}</form><div id="posts">${posts.length ? posts.map(postCard).join('') : empty('Jadilah pembuka percakapan.', 'Belum ada diskusi. Bagikan pertanyaan pertamamu.')}</div></section><aside class="card"><h2>Punya pertanyaan?</h2><p class="muted">Gunakan judul yang jelas dan jelaskan apa yang sudah kamu coba. Hindari berbagi informasi pribadi.</p>${state.user ? `<form id="post-form" class="form-stack">${field('Judul pertanyaan', '<input name="title" required minlength="5" maxlength="120" placeholder="Bagaimana cara…?">')}${field('Mata pelajaran', `<select name="subject" required>${options(Object.keys(state.catalogue.subjects), '')}</select>`)}${field('Detail pertanyaan', '<textarea name="body" required minlength="5" maxlength="4000"></textarea>')}${errorBox}<button class="button" type="submit">Buka diskusi</button></form>` : '<a class="button" id="forum-login" href="#/login">Masuk untuk bertanya</a>'}</aside></div>`,
    mount(root) {
      const filters = root.querySelector('#forum-filters');
      const filter = () => {
        const f = Object.fromEntries(new FormData(filters));
        const selected = posts.filter(
          (p) =>
            (!f.subject || p.subject === f.subject) &&
            (!f.search ||
              (p.title + ' ' + p.body).toLowerCase().includes(f.search.trim().toLowerCase())),
        );
        root.querySelector('#posts').innerHTML = selected.length
          ? selected.map(postCard).join('')
          : empty(
              'Belum ada diskusi yang cocok.',
              'Ubah kata pencarian atau mulai pertanyaan baru.',
            );
      };
      filters.oninput = filter;
      filters.onsubmit = (event) => {
        event.preventDefault();
        filter();
      };
      root
        .querySelector('#forum-login')
        ?.addEventListener('click', () => sessionStorage.setItem('tutordek-return', '/forum'));
      const form = root.querySelector('#post-form');
      if (form)
        form.onsubmit = (event) => {
          event.preventDefault();
          submit(form, async () => {
            const result = await api('posts', Object.fromEntries(new FormData(form)));
            toast('Diskusi dibuka.');
            location.hash = '/thread/' + result.id;
          });
        };
    },
  };
}

export async function threadPage(id) {
  const data = await api('posts/' + encodeURIComponent(id));
  const p = data.post;
  return {
    html: `<p><a href="#/forum">← Semua diskusi</a></p>${heading(p.subject, p.title, `${p.name} · ${when(p.created)}`)}<div class="thread-layout"><article class="card"><p class="prewrap">${esc(p.body)}</p></article><section class="section"><h2>${data.replies.length} balasan</h2><div>${data.replies.length ? data.replies.map((r) => `<article class="card reply-card"><h3>${esc(r.name)}</h3><p class="prewrap">${esc(r.body)}</p><small class="muted">${when(r.created)}</small></article>`).join('') : empty('Percakapan baru dimulai.', 'Bantu dengan penjelasan yang ramah dan mudah dipahami.')}</div><form id="reply-form" class="card form-stack">${field('Balasanmu', '<textarea name="body" required maxlength="4000" placeholder="Bagikan penjelasan atau pertanyaan lanjutan…"></textarea>')}${errorBox}<button type="submit" class="button">${state.user ? 'Kirim balasan' : 'Masuk untuk membalas'}</button></form></section></div>`,
    mount(root) {
      const form = root.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        if (!requireUser('/thread/' + id)) return;
        submit(form, async () => {
          await api(`posts/${id}/reply`, { body: form.elements.body.value });
          toast('Balasan disimpan.');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
      };
    },
  };
}

export async function reviewsPage() {
  const reviews = await api('reviews');
  return {
    html:
      heading(
        'Ulasan pembelajar',
        'Cerita dari sesi yang selesai.',
        'Ulasan berasal dari pemesanan yang telah diselesaikan di aplikasi demo ini.',
      ) +
      (reviews.length
        ? `<div class="grid">${reviews.map((r) => `<article class="card"><p class="review-stars" aria-label="${r.rating} dari 5 bintang">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</p><p class="prewrap">${esc(r.body)}</p><h3>${esc(r.name)}</h3><p class="muted">Tutor: ${esc(tutor(r.tutor_id)?.name)}<br>${when(r.created)}</p></article>`).join('')}</div>`
        : empty(
            'Cerita pertamamu belum ditulis.',
            'Selesaikan sesi dan beri ulasan dari dashboard. Tidak ada testimoni buatan.',
            '/dashboard',
            'Ke dashboard',
          )),
  };
}
