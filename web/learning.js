import {
  state,
  api,
  esc,
  when,
  lesson,
  options,
  field,
  empty,
  heading,
  errorBox,
  submit,
  refresh,
  toast,
  download,
  requireUser,
} from './core.js';

function lessonCard(l) {
  const complete = state.dashboard?.completions.includes(l.id);
  return `<article class="card lesson-card"><div class="row between"><span class="chip">${l.subject}</span><span class="muted">${l.minutes} menit</span></div><div class="lesson-symbol" aria-hidden="true">${{ Matematika: 'x²', Inggris: 'Aa', Sains: '☀', Fisika: 'v=s/t', Biologi: '◉', Kimia: 'H₂O', Mandarin: '你好' }[l.subject]}</div><p class="eyebrow">${l.level} · Materi asli TutorDek</p><h3><a href="#/lesson/${l.id}">${esc(l.title)}</a></h3><p class="muted">${esc(l.sections[0][1].slice(0, 100))}…</p><div class="row"><a class="button secondary small" href="#/lesson/${l.id}">${complete ? 'Baca kembali' : 'Buka materi'}</a>${complete ? '<span class="chip green">✓ Selesai</span>' : ''}</div></article>`;
}

export async function libraryPage() {
  if (state.user) await refresh();
  return {
    html:
      heading(
        'Perpustakaan belajar',
        'Rasa ingin tahu, bertemu penjelasan.',
        'Materi contoh asli TutorDek. Baca, unduh, lalu uji pemahamanmu.',
        '<a class="button secondary" href="#/packages">Lihat paket belajar</a>',
      ) +
      `<form class="filters" id="library-filters">${field('Cari materi', '<input type="search" name="search" placeholder="Cari judul atau topik…">')}${field('Mata pelajaran', `<select name="subject">${options(Object.keys(state.catalogue.subjects), '', 'Semua pelajaran')}</select>`)}${field('Jenjang', `<select name="level">${options(['SD', 'SMP', 'SMA'], '', 'Semua jenjang')}</select>`)}</form><p id="library-status" role="status" class="muted"></p><div class="grid" id="lessons">${state.catalogue.lessons.map(lessonCard).join('')}</div>`,
    mount(root) {
      const form = root.querySelector('form');
      const filter = () => {
        const f = Object.fromEntries(new FormData(form));
        const items = state.catalogue.lessons.filter(
          (l) =>
            (!f.search ||
              (l.title + ' ' + l.subject).toLowerCase().includes(f.search.trim().toLowerCase())) &&
            (!f.subject || l.subject === f.subject) &&
            (!f.level || l.level === f.level),
        );
        root.querySelector('#library-status').textContent = `${items.length} materi ditemukan.`;
        root.querySelector('#lessons').innerHTML = items.length
          ? items.map(lessonCard).join('')
          : empty('Materi belum ditemukan.', 'Coba kata pencarian atau filter lain.');
      };
      form.oninput = filter;
      form.onsubmit = (event) => {
        event.preventDefault();
        filter();
      };
      filter();
    },
  };
}

export async function lessonPage(id) {
  const l = lesson(id);
  if (!l)
    return {
      html: empty(
        'Materi tidak ditemukan.',
        'Pilih bacaan lain di perpustakaan.',
        '/library',
        'Ke perpustakaan',
      ),
    };
  if (state.user) await refresh();
  const complete = state.dashboard?.completions.includes(id);
  const article = `<p class="eyebrow">${l.subject} · ${l.level} · ${l.minutes} menit</p><h1>${esc(l.title)}</h1><p class="muted">Materi contoh asli TutorDek · dapat dibaca dan dibagikan untuk belajar.</p>${l.sections.map(([title, body], i) => `<section><span class="section-number" aria-hidden="true">0${i + 1}</span><h2>${esc(title)}</h2><p>${esc(body)}</p></section>`).join('')}`;
  return {
    html: `<p class="no-print"><a href="#/library">← Perpustakaan</a></p><article class="lesson-content">${article}<div class="no-print row" style="margin-top:30px"><button class="button" id="complete-lesson" ${complete ? 'disabled' : ''}>${complete ? '✓ Materi selesai' : 'Tandai selesai'}</button><a class="button secondary" href="#/quiz/${id}">Latihan materi</a><button class="button secondary" id="download-ebook">Unduh e-book</button><button class="button secondary" id="print-lesson">Cetak</button></div><p class="muted no-print" style="margin-top:15px">Unduhan berformat HTML dan bisa dibaca di browser tanpa internet. Gunakan Cetak untuk menyimpan sebagai PDF.</p></article>`,
    mount(root) {
      root.querySelector('#complete-lesson').onclick = async (event) => {
        if (!requireUser('/lesson/' + id)) return;
        const button = event.currentTarget;
        button.disabled = true;
        try {
          await api('learning/complete', { lessonId: id });
          button.textContent = '✓ Materi selesai';
          toast('Satu langkah lagi. Materi selesai!');
        } catch (error) {
          toast(error.message);
          button.disabled = false;
        }
      };
      root.querySelector('#download-ebook').onclick = () =>
        download(
          `TutorDek-${id}.html`,
          `<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(l.title)}</title><style>body{font-family:system-ui;line-height:1.8;max-width:760px;margin:40px auto;padding:0 24px;color:#122d47}section{margin-top:35px}.section-number{color:#054a91}h1{line-height:1.2}</style><body>${article}</body></html>`,
        );
      root.querySelector('#print-lesson').onclick = () => window.print();
    },
  };
}

export async function packagesPage() {
  if (state.user) await refresh();
  return {
    html:
      heading(
        'Paket belajar',
        'Satu rencana. Banyak kemungkinan.',
        'Kumpulan materi mandiri gratis untuk menjaga langkah belajarmu tetap terarah.',
      ) +
      `<div class="grid">${state.catalogue.packages
        .map((p, i) => {
          const enrolled = state.dashboard?.enrollments.includes(p.id);
          return `<article class="card package-card"><span class="chip">${p.level}</span><div class="package-index" aria-hidden="true">0${i + 1}</div><h2>${esc(p.name)}</h2><p class="muted">${esc(p.description)}</p><ul>${p.lessons.map((id) => `<li><a href="#/lesson/${id}">${esc(lesson(id).title)}</a></li>`).join('')}</ul><div class="row"><strong>Gratis</strong><span class="muted">${p.lessons.length} materi + latihan</span></div><button class="button" data-enroll="${p.id}" ${enrolled ? 'disabled' : ''}>${enrolled ? '✓ Ditambahkan' : 'Tambahkan ke rencana'}</button></article>`;
        })
        .join(
          '',
        )}</div><div class="callout" style="margin-top:28px">Paket mandiri ini tidak menjual langganan atau kelas live. Untuk sesi tutor, buat pemesanan terpisah dengan checkout simulasi.</div>`,
    mount(root) {
      root.querySelectorAll('[data-enroll]').forEach(
        (button) =>
          (button.onclick = async () => {
            if (!requireUser('/packages')) return;
            button.disabled = true;
            try {
              await api('learning/enroll', { packageId: button.dataset.enroll });
              button.textContent = '✓ Ditambahkan';
              toast('Paket ditambahkan ke rencana belajarmu.');
            } catch (error) {
              toast(error.message);
              button.disabled = false;
            }
          }),
      );
    },
  };
}

export function practicePage() {
  return {
    html:
      heading(
        'BrainBoost',
        'Sedikit latihan. Banyak kemajuan.',
        'Dua soal per materi, dengan penjelasan setelah menjawab.',
      ) +
      `<div class="callout row between"><div><strong>Ingin tantangan yang lebih luas?</strong><br>Tryout menggabungkan ${state.catalogue.lessons.length * 2} soal lintas bidang, tanpa batas waktu.</div><a class="button" href="#/quiz/tryout">Mulai tryout</a></div><div class="grid">${state.catalogue.lessons.map((l) => `<article class="card"><span class="chip">${l.subject} · ${l.level}</span><h2 style="margin-top:20px;font-size:22px">${esc(l.title)}</h2><p class="muted">2 soal · Penjelasan setiap jawaban</p><a class="button secondary" href="#/quiz/${l.id}">Mulai latihan →</a></article>`).join('')}</div>`,
  };
}

export async function quizPage(id) {
  const quiz = await api('quiz/' + encodeURIComponent(id));
  const title = id === 'tryout' ? 'Tryout lintas bidang' : lesson(id)?.title;
  return {
    html:
      heading(
        'Latihan pemahaman',
        title,
        'Jawab semua soal untuk melihat hasilnya. Masuk untuk menyimpan nilai latihanmu.',
      ) +
      `<form id="quiz-form" class="quiz-layout">${quiz.questions.map((q, i) => `<fieldset class="card question"><legend>${i + 1}. ${esc(q.question)}</legend><div class="choices">${q.options.map((choice, j) => `<label class="choice"><input type="radio" name="${esc(q.id)}" value="${j}" required><span>${esc(choice)}</span></label>`).join('')}</div></fieldset>`).join('')}${errorBox}<button class="button" type="submit">Periksa jawaban</button></form><section id="quiz-result" aria-live="polite"></section>`,
    mount(root) {
      const form = root.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        if (!requireUser('/quiz/' + id)) return;
        submit(form, async () => {
          const answers = Object.fromEntries(
            [...new FormData(form)].map(([key, value]) => [key, Number(value)]),
          );
          const result = await api('quiz', { quizId: id, answers });
          form.hidden = true;
          const target = root.querySelector('#quiz-result');
          target.innerHTML = `<div class="score-card"><p class="eyebrow">Latihan selesai</p><h2>${result.score}<span> / 100</span></h2><p>${result.correct} dari ${result.total} jawaban benar. Hasilnya sudah tersimpan.</p><div class="row"><a class="button" href="#/progress">Lihat progres</a><button class="button secondary" id="retry-quiz">Coba lagi</button></div></div>${result.feedback.map((f, i) => `<article class="card feedback"><span class="chip ${f.correct ? 'green' : 'orange'}">${f.correct ? 'Benar' : 'Belum tepat'}</span><h3>${i + 1}. ${esc(quiz.questions[i].question)}</h3><p><strong>Jawaban: ${esc(quiz.questions[i].options[f.answer])}</strong></p><p class="muted">${esc(f.explanation)}</p></article>`).join('')}`;
          target.querySelector('#retry-quiz').onclick = () =>
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          target.querySelector('h2').setAttribute('tabindex', '-1');
          target.querySelector('h2').focus();
        });
      };
    },
  };
}

export async function progressPage() {
  const data = await refresh();
  const average = data.attempts.length
    ? Math.round(data.attempts.reduce((sum, a) => sum + a.score, 0) / data.attempts.length)
    : 0;
  return {
    html:
      heading(
        'Progres belajar',
        'Lihat sejauh mana kamu melangkah.',
        'Kemajuan berasal dari materi dan latihan yang benar-benar kamu selesaikan.',
      ) +
      `<div class="stats"><div class="stat"><strong>${data.completions.length}/${state.catalogue.lessons.length}</strong><span>Materi selesai</span></div><div class="stat"><strong>${data.attempts.length}</strong><span>Latihan diselesaikan</span></div><div class="stat"><strong>${average}</strong><span>Nilai rata-rata / 100</span></div></div><div class="grid two"><section class="card"><h2>Target belajarmu</h2><p class="muted">Target total materi selesai. Sesuaikan dengan ritmemu.</p><progress value="${Math.min(data.completions.length, data.goal)}" max="${data.goal}" aria-label="Kemajuan target materi"></progress><p>${data.completions.length} dari ${data.goal} materi target selesai.</p><form id="goal-form" class="form-stack">${field('Target jumlah materi', `<input type="number" name="target" min="1" max="${state.catalogue.lessons.length}" value="${data.goal}" required>`)}${errorBox}<button type="submit" class="button">Simpan target</button></form></section><section class="card"><h2>Rencana belajar</h2>${
        data.enrollments.length
          ? data.enrollments
              .map((id) => {
                const p = state.catalogue.packages.find((p) => p.id === id);
                return `<h3>${esc(p.name)}</h3><ul class="learning-list">${p.lessons.map((l) => `<li><a href="#/lesson/${l}">${esc(lesson(l).title)}</a><span>${data.completions.includes(l) ? '✓' : '○'}</span></li>`).join('')}</ul>`;
              })
              .join('')
          : '<p class="muted">Belum ada paket dalam rencana. Pilih kumpulan materi untuk mulai.</p>'
      }<a href="#/packages">Jelajahi paket →</a></section></div><section class="section"><h2>Materi yang sudah selesai</h2>${
        data.completions.length
          ? `<div class="grid">${state.catalogue.lessons
              .filter((l) => data.completions.includes(l.id))
              .map(lessonCard)
              .join('')}</div>`
          : empty(
              'Langkah pertamamu menunggu.',
              'Baca satu materi lalu tandai selesai.',
              '/library',
              'Jelajahi materi',
            )
      }</section><section class="section"><h2>Riwayat latihan</h2>${data.attempts.length ? `<div class="table-scroll"><table><caption class="sr-only">Hasil latihan tersimpan</caption><thead><tr><th>Latihan</th><th>Nilai</th><th>Jawaban benar</th><th>Waktu</th></tr></thead><tbody>${data.attempts.map((a) => `<tr><td>${a.quiz_id === 'tryout' ? 'Tryout lintas bidang' : esc(lesson(a.quiz_id)?.title)}</td><td><strong>${a.score}/100</strong></td><td>${a.correct}/${a.total}</td><td>${when(a.created)}</td></tr>`).join('')}</tbody></table></div>` : empty('Belum ada hasil latihan.', 'Coba BrainBoost untuk mengukur pemahamanmu.', '/practice', 'Mulai latihan')}</section>`,
    mount(root) {
      const form = root.querySelector('#goal-form');
      form.onsubmit = (event) => {
        event.preventDefault();
        submit(form, async () => {
          await api('learning/goal', { target: Number(form.elements.target.value) });
          toast('Target belajar disimpan.');
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        });
      };
    },
  };
}

function assistantEntry(entry) {
  return `<article class="assistant-entry"><p class="chat-question"><strong>Kamu</strong><br>${esc(entry.question)}</p><div class="chat-answer"><strong>Asisten materi</strong><p class="prewrap">${esc(entry.answer)}</p>${entry.sources.length ? `<p class="muted">Sumber materi:</p><div class="row">${entry.sources.map((s) => `<a class="chip" href="#/lesson/${s.id}">${esc(s.title)} →</a>`).join('')}</div>` : ''}</div></article>`;
}

export async function assistantPage() {
  const history = await api('assistant');
  return {
    html:
      heading(
        'Asisten belajar',
        'Mulai dengan satu pertanyaan.',
        'Temukan penjelasan dan sumber bacaan dari materi TutorDek.',
      ) +
      `<div class="callout">Asisten ini mencari materi yang relevan dari perpustakaan. Ini bukan model AI; pertanyaan di luar materi mungkin belum dapat dijawab. Untuk bantuan khusus, gunakan sesi tutor.</div><div class="assistant-layout"><section id="assistant-history" aria-label="Percakapan asisten">${history.length ? history.map(assistantEntry).join('') : empty('Apa yang ingin kamu pahami?', 'Coba: “Bagaimana cara menyelesaikan persamaan aljabar?”')}</section><form id="assistant-form" class="card form-stack">${field('Pertanyaanmu', '<textarea name="question" required minlength="3" maxlength="1000" placeholder="Misalnya: jelaskan teorema Pythagoras"></textarea>')}${errorBox}<button type="submit" class="button">Cari penjelasan →</button></form></div>`,
    mount(root) {
      const form = root.querySelector('form');
      form.onsubmit = (event) => {
        event.preventDefault();
        submit(form, async () => {
          const question = form.elements.question.value;
          const answer = await api('assistant', { question });
          const target = root.querySelector('#assistant-history');
          target.querySelector('.empty')?.remove();
          target.insertAdjacentHTML('beforeend', assistantEntry({ question, ...answer }));
          form.reset();
          toast('Penjelasan ditambahkan ke percakapan.');
          target.lastElementChild.scrollIntoView({
            block: 'center',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'instant'
              : 'smooth',
          });
        });
      };
    },
  };
}
