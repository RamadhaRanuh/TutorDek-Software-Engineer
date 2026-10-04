/* Wire the original pages' unfinished controls without replacing their layouts. */
(() => {
  const { request, escape: e, modal, action, status } = TutorDek;
  const money = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  const catalogue = () => request('catalogue');
  function button(label, id = '') {
    return `<button class="service-button" type="button" ${id ? `id="${id}"` : ''}>${e(label)}</button>`;
  }
  function keyboard(node, label) {
    if (!node) return;
    if (!['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(node.tagName)) {
      node.tabIndex = 0;
      node.setAttribute('role', 'button');
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          node.click();
        }
      });
    }
    if (label) node.setAttribute('aria-label', label);
  }
  async function materials(subject = '', query = '', level = '') {
    const data = await catalogue();
    const lessons = data.lessons.filter(
      (l) =>
        (!subject || l.subject === subject) &&
        (!level || l.level === level) &&
        (!query || (l.title + l.subject).toLowerCase().includes(query.toLowerCase())),
    );
    const body = modal(
      'Materi belajar',
      '<p>Materi contoh orisinal TutorDek. Buku penerbit dan video berlisensi belum tersedia.</p>' +
        (lessons.length
          ? lessons
              .map(
                (l) =>
                  `<div class="service-card"><h3>${e(l.title)}</h3><p>${e(l.subject)} · ${e(l.level)} · ${l.minutes} menit</p>${button('Baca materi', l.id)}</div>`,
              )
              .join('')
          : '<p>Tidak ada materi yang cocok. Coba kata kunci lain.</p>'),
    );
    for (const lesson of lessons)
      body.querySelector('#' + lesson.id).onclick = () => run(() => read(lesson.id));
  }
  async function read(id) {
    const data = await catalogue(),
      lesson = data.lessons.find((l) => l.id === id);
    const body = modal(
      lesson.title,
      lesson.sections.map(([heading, copy]) => `<h3>${e(heading)}</h3><p>${e(copy)}</p>`).join('') +
        button('Tandai selesai', 'completeLesson') +
        button('Latihan soal', 'lessonQuiz') +
        button('Dengarkan ringkasan', 'listenLesson'),
    );
    action(
      body.querySelector('#completeLesson'),
      async () => {
        if (!(await TutorDek.requireUser())) return;
        await request('learning/complete', { lessonId: id });
        status(body, 'Materi selesai dan kemajuan tersimpan.');
      },
      body,
    );
    body.querySelector('#lessonQuiz').onclick = () => run(() => quiz(id));
    body.querySelector('#listenLesson').onclick = () => {
      if (!('speechSynthesis' in window))
        return status(
          body,
          'Pembacaan audio tidak tersedia di browser ini. Materi tetap dapat dibaca.',
        );
      speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(
        lesson.sections.map((x) => x.join('. ')).join('. '),
      );
      voice.lang = 'id-ID';
      speechSynthesis.speak(voice);
      status(body, 'Membacakan materi contoh dengan suara browser.');
    };
    const download = document.createElement('button');
    download.className = 'service-button';
    download.type = 'button';
    download.textContent = 'Unduh materi';
    body.append(download);
    download.onclick = () => {
      const content =
        lesson.title +
        '\n\nMateri contoh orisinal TutorDek\n\n' +
        lesson.sections.map(([heading, copy]) => heading + '\n' + copy).join('\n\n');
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tutordek-' + lesson.id + '.txt';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
  }
  async function quiz(id = 'tryout', title = 'Latihan & TryOut') {
    const data = await request('quiz/' + id);
    const body = modal(
      title,
      `<form id="quizForm">${data.questions.map((q, n) => `<fieldset><legend>${n + 1}. ${e(q.question)}</legend>${q.options.map((option, index) => `<label><input type="radio" name="${e(q.id)}" value="${index}" required> ${e(option)}</label>`).join('')}</fieldset>`).join('')}<button class="service-button" type="submit">Periksa jawaban</button></form>`,
    );
    action(
      body.querySelector('form'),
      async () => {
        if (!(await TutorDek.requireUser())) return;
        const answers = Object.fromEntries(
          [...new FormData(body.querySelector('form'))].map(([key, value]) => [key, Number(value)]),
        );
        const result = await request('quiz', { quizId: id, answers });
        const feedback = document.createElement('div');
        feedback.className = 'service-card';
        feedback.innerHTML =
          `<h3>Nilai ${result.score}%</h3><p>${result.correct} dari ${result.total} benar. Hasil tersimpan.</p>` +
          result.feedback.map((f) => `<p>${e(f.explanation)}</p>`).join('');
        body.querySelector('.quiz-feedback')?.remove();
        feedback.classList.add('quiz-feedback');
        body.append(feedback);
      },
      body,
    );
  }
  async function dashboard() {
    if (!(await TutorDek.requireUser())) return;
    const [data, cat] = await Promise.all([request('dashboard'), catalogue()]);
    const body = modal(
      'Progress Tracking & Sesi Saya',
      `<p>${data.completions.length} materi selesai · ${data.attempts.length} latihan · ${data.enrollments.length} koleksi tersimpan.</p><form id="goalForm"><label>Target materi selesai<input name="target" type="number" min="1" max="${cat.lessons.length}" value="${data.goal}" required></label><button type="submit" class="service-button">Simpan target</button></form><h3>Sesi saya</h3><p>Pemesanan dan pembayaran adalah simulasi. Pertemuan video dan kehadiran tutor perlu layanan yang dikonfigurasi.</p>${
        data.bookings.length
          ? data.bookings
              .map((b) => {
                const name = cat.tutors.find((t) => t.id === b.tutor_id)?.name;
                return `<div class="service-card" data-booking="${b.id}"><h3>${e(name)}</h3><p>${e(b.subject)} · ${e(b.mode)} · ${new Date(b.start * 1000).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p><p>${e(b.status)} · ${money(b.total)}</p>${b.mode === 'Offline' ? `<p>${e(b.address)}</p>` : ''}<label>Catatan sesi<textarea maxlength="10000">${e(b.notes)}</textarea></label>${button('Simpan catatan', 'notes-' + b.id)}${['pending', 'confirmed'].includes(b.status) ? button('Batalkan sesi', 'cancel-' + b.id) : ''}${b.status === 'pending' && b.start > data.now ? button('Bayar simulasi', 'pay-' + b.id) : ''}${b.status === 'confirmed' && b.end <= data.now ? button('Selesaikan sesi', 'complete-' + b.id) : ''}${b.status === 'completed' && !b.reviewed ? `<form class="review-form"><label>Rating<select name="rating">${[5, 4, 3, 2, 1].map((r) => `<option value="${r}">${r}</option>`).join('')}</select></label><label>Ulasan<textarea name="body" minlength="5" maxlength="2000" required></textarea></label><button class="service-button" type="submit">Kirim ulasan</button></form>` : ''}</div>`;
              })
              .join('')
          : '<p>Belum ada sesi. Mulai dari Pesan Guru.</p>'
      }<h3>Koleksi saya</h3>${data.enrollments.map((id) => `<p>${e(cat.packages.find((p) => p.id === id)?.name)}</p>`).join('') || '<p>Belum ada koleksi tersimpan.</p>'}<h3>Riwayat latihan</h3>${data.attempts.map((a) => `<p>${e(a.quiz_id)} · ${a.score}%</p>`).join('') || '<p>Belum ada latihan.</p>'}${button('Keluar akun', 'logout')}`,
    );
    action(
      body.querySelector('#goalForm'),
      async () => {
        await request('learning/goal', {
          target: Number(body.querySelector('[name=target]').value),
        });
        status(body, 'Target tersimpan.');
      },
      body,
    );
    action(
      body.querySelector('#logout'),
      async () => {
        await request('logout', {});
        location.reload();
      },
      body,
    );
    for (const booking of data.bookings) {
      const card = body.querySelector(`[data-booking="${booking.id}"]`);
      for (const kind of ['notes', 'cancel', 'pay', 'complete']) {
        const control = card.querySelector('#' + kind + '-' + booking.id);
        if (!control) continue;
        action(
          control,
          async () => {
            await request(
              `bookings/${booking.id}/${kind}`,
              kind === 'notes'
                ? { notes: card.querySelector('textarea').value }
                : kind === 'pay'
                  ? { method: 'Demo bank' }
                  : {},
            );
            if (kind === 'notes') status(card, 'Catatan tersimpan.');
            else await dashboard();
          },
          card,
        );
      }
      if (card.querySelector('.review-form'))
        action(
          card.querySelector('.review-form'),
          async () => {
            await request(`bookings/${booking.id}/review`, {
              rating: Number(card.querySelector('[name=rating]').value),
              body: card.querySelector('[name=body]').value,
            });
            await dashboard();
          },
          card,
        );
    }
  }
  async function forum() {
    const [posts, cat] = await Promise.all([request('posts'), catalogue()]);
    const body = modal(
      'Forum Discussion',
      `<form id="postForm"><label>Judul<input name="title" minlength="5" maxlength="120" required></label><label>Mata pelajaran<select name="subject">${Object.keys(
        cat.subjects,
      )
        .map((s) => `<option>${e(s)}</option>`)
        .join(
          '',
        )}</select></label><label>Pertanyaan<textarea name="body" minlength="5" maxlength="4000" required></textarea></label><button class="service-button" type="submit">Kirim diskusi</button></form><h3>Diskusi</h3>${posts.map((p) => `<div class="service-card"><h3>${e(p.title)}</h3><p>${e(p.name)} · ${e(p.subject)}</p>${button('Buka diskusi', p.id)}</div>`).join('') || '<p>Belum ada diskusi.</p>'}`,
    );
    action(
      body.querySelector('form'),
      async () => {
        if (!(await TutorDek.requireUser())) return;
        await request('posts', Object.fromEntries(new FormData(body.querySelector('form'))));
        await forum();
      },
      body,
    );
    posts.forEach(
      (post) =>
        (body.querySelector('#' + CSS.escape(post.id)).onclick = () => run(() => thread(post.id))),
    );
  }
  async function thread(id) {
    const { post, replies } = await request('posts/' + id);
    const body = modal(
      post.title,
      `<p>${e(post.name)} · ${e(post.subject)}</p><div class="service-card">${e(post.body)}</div>${replies.map((r) => `<div class="service-card"><b>${e(r.name)}</b><p>${e(r.body)}</p></div>`).join('')}<form><label>Balasan<textarea name="body" minlength="1" maxlength="4000" required></textarea></label><button class="service-button" type="submit">Kirim balasan</button></form>`,
    );
    action(
      body.querySelector('form'),
      async () => {
        if (!(await TutorDek.requireUser())) return;
        await request('posts/' + id + '/reply', { body: body.querySelector('textarea').value });
        await thread(id);
      },
      body,
    );
  }
  async function assistant() {
    if (!(await TutorDek.requireUser())) return;
    const history = await request('assistant');
    const body = modal(
      'Robot Tutor',
      '<p>Pencarian materi lokal, bukan model AI generatif. Jawaban hanya berasal dari materi contoh TutorDek.</p>' +
        history
          .map(
            (m) => `<div class="service-card"><b>${e(m.question)}</b><p>${e(m.answer)}</p></div>`,
          )
          .join('') +
        '<form><label>Pertanyaan<input name="question" minlength="3" maxlength="1000" required placeholder="Contoh: Bagaimana menghitung Pythagoras?"></label><button class="service-button" type="submit">Cari penjelasan</button></form>',
    );
    action(
      body.querySelector('form'),
      async () => {
        const result = await request('assistant', { question: body.querySelector('input').value });
        const answer = document.createElement('div');
        answer.className = 'service-card';
        answer.innerHTML = `<p>${e(result.answer)}</p><p>Sumber: ${result.sources.map((s) => e(s.title)).join(', ') || 'Materi yang cocok belum tersedia'}</p>`;
        body.querySelector('form').before(answer);
      },
      body,
    );
  }
  async function messages() {
    if (!(await TutorDek.requireUser())) return;
    const [history, cat] = await Promise.all([request('messages'), catalogue()]);
    const body = modal(
      'Live Tutoring',
      '<p>Pesan dicatat untuk akunmu dalam simulasi lokal. Balasan tutor dan panggilan video belum terhubung.</p><a class="service-button" href="pesan-kelas-milih.html">Pesan tutor</a>' +
        history
          .map(
            (m) =>
              `<div class="service-card"><b>${e(cat.tutors.find((t) => t.id === m.tutor_id)?.name)}</b><p>${e(m.body)}</p></div>`,
          )
          .join('') +
        `<form><label>Tutor<select name="tutorId">${cat.tutors.map((t) => `<option value="${t.id}">${e(t.name)}</option>`).join('')}</select></label><label>Pesan<textarea name="body" minlength="1" maxlength="2000" required></textarea></label><button class="service-button" type="submit">Simpan pesan</button></form>`,
    );
    action(
      body.querySelector('form'),
      async () => {
        await request('messages', Object.fromEntries(new FormData(body.querySelector('form'))));
        await messages();
      },
      body,
    );
  }
  async function promo() {
    const cat = await catalogue(),
      p = cat.promos[0];
    const body = modal(
      'Klaim promo',
      `<h3>${e(p.code)}</h3><p>${e(p.description)}</p><p>Berlaku pada pemesanan tutor simulasi, satu kode per sesi. Tidak berlaku untuk langganan paket berbayar. Banner Ramadhan adalah contoh desain awal.</p>${button('Gunakan promo', 'claimPromo')}`,
    );
    body.querySelector('button').onclick = () => {
      sessionStorage.setItem('tutordek-promo', p.code);
      status(body, 'Kode tersimpan dan akan diterapkan di checkout.');
    };
  }
  async function packageDetail(index) {
    const cat = await catalogue(),
      pkg = cat.packages.filter((p) => p.price !== undefined)[index];
    const body = modal(
      pkg.name,
      `<p>Harga pada katalog: <b>${money(pkg.price)}</b>.</p><p>${e(pkg.description)} Tidak ada pembayaran atau aktivasi langganan pada pratinjau ini.</p>${pkg.lessons.map((id) => `<div class="service-card">${e(cat.lessons.find((l) => l.id === id).title)} ${button('Baca', id)}</div>`).join('')}${button('Simpan koleksi demo', 'enroll')}`,
    );
    pkg.lessons.forEach((id) => (body.querySelector('#' + id).onclick = () => run(() => read(id))));
    action(
      body.querySelector('#enroll'),
      async () => {
        if (!(await TutorDek.requireUser())) return;
        await request('learning/enroll', { packageId: pkg.id });
        status(body, 'Koleksi demo tersimpan. Ini bukan langganan berbayar.');
      },
      body,
    );
  }
  function run(work) {
    return Promise.resolve()
      .then(work)
      .catch((error) => modal('Tidak dapat melanjutkan', `<p>${e(error.message)}</p>`));
  }
  function openFeature(id) {
    return run(
      {
        videosoal: materials,
        tryout: quiz,
        brainboost: () => quiz('bilangan', 'BrainBoost'),
        robottutor: assistant,
        livetutor: messages,
        progresstracking: dashboard,
        forumdiscussion: forum,
      }[id] || materials,
    );
  }
  TutorDek.openFeature = openFeature;
  document.querySelector('[class^="desktop-"]')?.setAttribute('role', 'main');
  document.querySelector('[class^="navbar"]')?.setAttribute('role', 'navigation');
  document.querySelector('[class^="footer"]')?.setAttribute('role', 'contentinfo');
  const originalTutorIds = ['anita', 'bella', 'dessy', 'rizky', 'ulil', 'reni', 'olive', 'ditto'];
  document
    .querySelectorAll('.popup[id^="popup-"]')
    .forEach((popup, index) =>
      popup
        .querySelectorAll('[onclick*="pesan-kelas-milih"]')
        .forEach(
          (node) =>
            (node.onclick = () =>
              (location.href = 'pesan-kelas-milih.html?tutor=' + originalTutorIds[index])),
        ),
    );
  document
    .querySelectorAll('[onclick], .close-btn, .google, .forgor')
    .forEach((node) => keyboard(node));
  // Keep profile/feature popups and add focus and Escape behavior.
  for (const popup of document.querySelectorAll('.popup')) {
    popup.setAttribute('aria-hidden', 'true');
    const content = popup.querySelector('.content, .content11');
    if (content) {
      content.setAttribute('role', 'dialog');
      content.setAttribute('aria-modal', 'true');
      content.setAttribute(
        'aria-label',
        popup.id === 'popupFitur' ? 'Fitur TutorDek' : 'Profil tutor',
      );
    }
    keyboard(popup.querySelector('.close-btn'), 'Tutup');
  }
  window.toggleFitur = () => togglePopup('popupFitur');
  for (let n = 1; n <= 8; n++) window['togglePopup' + n] = () => togglePopup('popup-' + n);
  function togglePopup(id) {
    const popup = document.getElementById(id);
    if (popup?.classList.contains('active')) TutorDek.close();
    else if (popup) TutorDek.activate(popup);
  }
  const featureNames = {
    'robot tutor': 'robottutor',
    'live tutoring': 'livetutor',
    'progress tracking': 'progresstracking',
    'forum discussion': 'forumdiscussion',
    brainboost: 'brainboost',
  };
  document.querySelectorAll('#popupFitur .menu2, #popupFitur .menu3').forEach((node) => {
    const id = Object.entries(featureNames).find(([name]) =>
      node.textContent.toLowerCase().includes(name),
    )?.[1];
    if (id) {
      node.onclick = () => openFeature(id);
      keyboard(node);
    }
  });
  document.querySelectorAll('.tab1').forEach((node) => {
    const id = node.id;
    keyboard(
      node,
      {
        videosoal: 'Video & Soal',
        tryout: 'TryOut',
        livetutor: 'Live Tutor',
        robottutor: 'Robot Tutor',
        brainboost: 'BrainBoost',
        progresstracking: 'Progress Tracking',
        forumdiscussion: 'Forum Discussion',
      }[id],
    );
    node.addEventListener(
      'click',
      () => (document.querySelector('.button45').onclick = () => openFeature(id)),
    );
  });
  const detail = document.querySelector('.button45');
  if (detail) {
    detail.onclick = () => openFeature('videosoal');
    keyboard(detail, 'Lihat detail fitur');
  }
  document.querySelectorAll('[class^="button"], .claim').forEach((node) => {
    const text = node.textContent.trim();
    if (['Claim', 'Claim Now', 'Claim Now!', 'Klaim', 'Klaim Sekarang'].includes(text)) {
      node.onclick = () => run(promo);
      keyboard(node, 'Klaim promo');
    }
    if (text === 'Pesan Sekarang' && !node.onclick) {
      node.onclick = () => (location.href = 'pesan-kelas-milih.html');
      keyboard(node);
    }
    if (text === 'Lihat Testimoni') {
      node.onclick = () => (location.href = 'testimoni.html');
      keyboard(node);
    }
    if (text === 'Explore Books' || text === 'Start Learning') {
      node.onclick = () => run(materials);
      keyboard(node);
    }
    if (text === 'Buy Now') {
      node.onclick = () => run(() => read('bilangan'));
      keyboard(node, 'Pratinjau materi');
    }
    if (text === 'Tonton Video') {
      node.onclick = () =>
        modal(
          'Cerita siswa',
          '<p>Video testimoni belum tersedia. Cerita pada halaman ini adalah contoh tampilan proyek.</p>',
        );
      keyboard(node);
    }
  });
  document.querySelectorAll('.more-detail').forEach((node, index) => {
    node.onclick = () => run(() => packageDetail(index));
    keyboard(node, 'Detail paket');
  });
  if (location.pathname.includes('paket-belajar')) {
    const cards = [...document.querySelectorAll('.more-detail')].map((node) =>
      node.closest(
        '.group-parent29,.button-parent35,.button-parent37,.button-parent38,.button-parent39,.button-parent40',
      ),
    );
    ['29', '30', '31', '32'].forEach((number, index) => {
      const node = document.querySelector('.button-parent' + number);
      if (!node) return;
      keyboard(node);
      node.onclick = () => {
        cards.forEach(
          (card, n) =>
            (card.hidden =
              index === 1 ? n > 1 : index === 2 ? n < 2 || n > 3 : index === 3 ? n < 4 : false),
        );
        document
          .querySelectorAll('[data-package-filter]')
          .forEach((item) => item.setAttribute('aria-pressed', item === node));
      };
      node.dataset.packageFilter = '';
      node.setAttribute('aria-pressed', index === 0);
    });
  }
  document.querySelectorAll('.search-bar').forEach((bar) => {
    const placeholder = [...bar.children].find(
      (node) => !node.querySelector('img') && node.textContent.includes('Cari'),
    );
    if (!placeholder) return;
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = placeholder.textContent.trim();
    input.setAttribute(
      'aria-label',
      location.pathname.includes('e-book')
        ? 'Cari materi'
        : 'Cari tutor, mata pelajaran, atau paket',
    );
    placeholder.replaceChildren(input);
    const search = () =>
      run(async () => {
        const query = input.value.trim().toLowerCase();
        if (!query) return materials();
        const cat = await catalogue(),
          tutors = cat.tutors.filter((t) => (t.name + t.subject).toLowerCase().includes(query)),
          packages = cat.packages.filter((p) => p.name.toLowerCase().includes(query)),
          lessons = cat.lessons.filter((l) => (l.title + l.subject).toLowerCase().includes(query));
        const body = modal(
          'Hasil pencarian',
          `<p>${e(input.value.trim())}</p>${tutors.map((t) => `<div class="service-card"><b>${e(t.name)}</b> · ${e(t.subject)} <a class="service-button" href="pesan-kelas-milih.html?tutor=${t.id}">Pesan tutor</a></div>`).join('')}${packages.map((p) => `<div class="service-card">${e(p.name)} <a class="service-button" href="paket-belajar.html">Lihat paket</a></div>`).join('')}${lessons.map((l) => `<div class="service-card">${e(l.title)} ${button('Baca', l.id)}</div>`).join('')}${!tutors.length && !packages.length && !lessons.length ? '<p>Tidak ada hasil. Coba kata kunci lain.</p>' : ''}`,
        );
        lessons.forEach(
          (l) => (body.querySelector('#' + l.id).onclick = () => run(() => read(l.id))),
        );
      });
    input.onkeydown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        search();
      }
    };
    const control = bar.querySelector('[class^=button]');
    if (control) {
      control.onclick = search;
      keyboard(control, 'Cari');
    }
  });
  document.querySelectorAll('.social-icon').forEach((node) => {
    node.onclick = () =>
      modal(
        'Hubungi TutorDek',
        '<p>Akun media sosial resmi belum dikonfigurasi untuk proyek ini.</p>',
      );
    keyboard(node, 'Informasi media sosial');
  });
  document
    .querySelectorAll(
      '[class^="navbar"] .home, [class^="navbar"] .home1, [class^="navbar"] .home2, [class^="navbar"] .home3',
    )
    .forEach((node) => {
      if (!node.closest('[onclick]')) {
        node.onclick = () => (location.href = 'landing-page.html');
        keyboard(node, 'Home');
      }
    });
  document.querySelectorAll('[class^="footer"] [class^="button"]').forEach((node) => {
    const text = node.textContent.trim().toLowerCase();
    const id = featureNames[text];
    if (id) {
      node.onclick = () => openFeature(id);
      keyboard(node);
    }
    if (text === 'testimonial') {
      node.onclick = () => (location.href = 'testimoni.html');
      keyboard(node);
    }
    if (text === 'about us') {
      node.onclick = () =>
        modal(
          'Tentang TutorDek',
          '<p>TutorDek adalah proyek pembelajaran untuk mencari tutor, memesan sesi, dan mempelajari materi contoh secara online atau offline.</p>',
        );
      keyboard(node);
    }
  });
  document.querySelectorAll('[class^="active-tabs"]').forEach((node) => {
    node.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    keyboard(node, 'Kembali ke atas');
  });
  if (location.pathname.includes('e-book')) {
    for (const [selector, subject] of [
      ['.button-parent17', 'Matematika'],
      ['.group-parent22', 'Sains'],
      ['.icon', 'Matematika'],
      ['.icon1', 'Fisika'],
      ['.icon2', 'Inggris'],
    ]) {
      const node = document.querySelector(selector);
      if (node) {
        node.onclick = () => run(() => materials(subject));
        keyboard(node, 'Pratinjau materi ' + subject);
      }
    }
    document.querySelectorAll('.buy-now').forEach((node, index) => {
      node.onclick = () =>
        run(() => read(['bilangan', 'perbandingan', 'pythagoras', 'kartesius'][index]));
      keyboard(node, 'Pratinjau materi contoh');
    });
    document.querySelectorAll('.play-button-1-icon').forEach((node, index) => {
      node.onclick = () =>
        run(() => read(['bilangan', 'perbandingan', 'pythagoras', 'kartesius'][index]));
      keyboard(node, 'Buka sampel audio');
    });
    document.querySelectorAll('.title-parent > [class^="button-parent"]').forEach((node, index) => {
      node.onclick = () => run(() => materials('', '', ['', 'SD', 'SMP', 'SMA'][index]));
      keyboard(node, 'Buka kategori materi');
    });
    let selectedBook = 0;
    document.querySelectorAll('.slider2 .button143').forEach((node, index) => {
      node.onclick = () => {
        selectedBook = (selectedBook + (index === 0 ? -1 : 1) + 2) % 2;
        run(() => materials(selectedBook === 0 ? 'Matematika' : 'Sains'));
      };
      keyboard(node, index === 0 ? 'Buku sebelumnya' : 'Buku berikutnya');
    });
  }
  const faqSearch = document.querySelector('.button46 .text48');
  if (faqSearch) {
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = faqSearch.textContent.trim();
    input.setAttribute('aria-label', 'Cari pertanyaan FAQ');
    faqSearch.replaceChildren(input);
    input.oninput = () =>
      document
        .querySelectorAll('.faq-accordian-item-wrap1')
        .forEach(
          (item) =>
            (item.hidden = !item.textContent.toLowerCase().includes(input.value.toLowerCase())),
        );
    const control = document.querySelector('.button46 .button47');
    if (control) {
      control.onclick = () => input.focus();
      keyboard(control, 'Cari pertanyaan FAQ');
    }
  }
  if (location.pathname.includes('testimoni')) {
    const trigger = document.querySelector('.button34');
    if (trigger)
      trigger.onclick = () =>
        run(async () => {
          const reviews = await request('reviews');
          modal(
            'Ulasan siswa',
            reviews.length
              ? reviews
                  .map(
                    (r) =>
                      `<div class="service-card"><b>${e(r.name)} · ${r.rating}/5</b><p>${e(r.body)}</p></div>`,
                  )
                  .join('')
              : '<p>Belum ada ulasan dari sesi yang diselesaikan. Cerita di halaman ini merupakan contoh desain awal.</p>',
          );
        });
  }
  request('me')
    .then(({ user }) => {
      if (!user) return;
      document.querySelectorAll('[onclick*="sign-in.html"]').forEach((node) => {
        node.onclick = () => openFeature('progresstracking');
        node.textContent = 'Akun Saya';
        keyboard(node);
      });
    })
    .catch(() => {});
})();
