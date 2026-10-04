/* Fix the existing five-step booking form; keep its controls and card artwork. */
let progress = 0;
let selectedClass = '',
  selectedGrade = '',
  selectedLesson = '',
  selectedMaterial = '';
let selectedTeacher = '',
  selectedPlace = '',
  selectedAlamat = '',
  selectedDate = '',
  selectedTime = '';
let selectedEmail = '',
  selectedPayment = '';
let catalogue,
  currentStep = 0,
  bookingId;
const automaticTutor = location.pathname.includes('random');
const pages = [...document.querySelectorAll('.page')];
const nextButton = document.querySelectorAll('.btn.btn-primary')[1];
const prevButton = document.querySelectorAll('.btn.btn-primary')[0];
const money = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

function validateForm() {
  if (currentStep === 0) return !!(selectedClass && selectedGrade);
  if (currentStep === 1) return !!(selectedLesson && selectedMaterial);
  if (currentStep === 2) return automaticTutor || !!selectedTeacher;
  if (currentStep === 3)
    return !!(
      selectedPlace &&
      selectedDate &&
      selectedTime &&
      (selectedPlace !== 'Offline' || selectedAlamat.trim().length >= 10)
    );
  return true;
}
function updateProgressBar(val) {
  progress = val;
  const bar = document.querySelector('.progress-bar');
  bar.style.width = `${progress}%`;
  bar.textContent = `${progress}%`;
  document.querySelector('.progress').setAttribute('aria-valuenow', progress);
}
function updateDisplay() {
  const teacher = catalogue.tutors.find((t) => t.id === selectedTeacher);
  const lesson = catalogue.lessons.find((l) => l.id === selectedMaterial);
  const values = {
    Class: selectedClass,
    Grade: selectedGrade,
    Lesson: selectedLesson,
    Material: lesson?.title || '',
    Teacher: teacher?.name || (automaticTutor ? 'Otomatis sesuai jadwal' : ''),
    Place: selectedPlace,
    Detail: `${selectedDate} ${selectedTime} WIB${selectedAlamat && selectedPlace === 'Offline' ? ' — ' + selectedAlamat : ''}`,
  };
  const labels = {
    Class: 'Jenjang',
    Grade: 'Kelas',
    Lesson: 'Mata pelajaran',
    Material: 'Materi',
    Teacher: 'Tutor',
    Place: 'Metode',
    Detail: 'Jadwal / alamat',
  };
  for (const key in values)
    document.getElementById('selected' + key).textContent = labels[key] + ': ' + values[key];
  const price = document.getElementById('selectedPrice');
  if (teacher) {
    const promo = catalogue.promos.find(
      (p) => p.code === document.getElementById('bookingPromo').value.trim().toUpperCase(),
    );
    const discount = promo ? Math.min((teacher.price * promo.percent) / 100, promo.cap) : 0;
    price.textContent = `Sesi 60 menit: ${money(teacher.price)} · Diskon ${money(discount)} · Total ${money(teacher.price - discount)} (simulasi)`;
  } else price.textContent = 'Harga mengikuti tutor yang tersedia; ditampilkan sebelum konfirmasi.';
}
function showPage(index) {
  currentStep = index;
  pages.forEach((page, i) => (page.style.display = i === index ? 'block' : 'none'));
  updateProgressBar(index * 25);
  prevButton.disabled = index === 0;
  nextButton.hidden = index === 4;
  const title = pages[index].querySelector('h2');
  if (title) {
    title.tabIndex = -1;
    title.focus();
  }
}
function showPreviousPage() {
  if (currentStep > 0) showPage(currentStep - 1);
}
async function showNextPage() {
  TutorDek.status(pages[currentStep], '');
  if (!validateForm())
    throw new Error('Lengkapi pilihan pada langkah ini. Alamat offline minimal 10 karakter.');
  if (currentStep === 1) renderTutors();
  if (currentStep === 3) {
    if (!/^\d{2}:00$/.test(selectedTime))
      throw new Error('Pilih jam bulat antara 08:00 dan 20:00 WIB.');
    const available = await TutorDek.request('availability', {
      date: selectedDate,
      hour: Number(selectedTime.slice(0, 2)),
    });
    const eligible = catalogue.tutors.filter(
      (t) =>
        t.subject === selectedLesson &&
        t.levels.includes(selectedClass) &&
        t.modes.includes(selectedPlace) &&
        available.available.includes(t.id),
    );
    if (automaticTutor) {
      eligible.sort((a, b) => b.rating - a.rating || a.price - b.price);
      selectedTeacher = eligible[0]?.id || '';
    }
    if (!eligible.some((t) => t.id === selectedTeacher))
      throw new Error('Tutor tidak tersedia pada jadwal/metode ini. Pilih waktu atau tutor lain.');
  }
  updateDisplay();
  if (currentStep < 4) showPage(currentStep + 1);
}
function renderTutors() {
  const tutors = catalogue.tutors
    .filter((t) => t.subject === selectedLesson && t.levels.includes(selectedClass))
    .sort(
      (a, b) =>
        Number(['fransiska', 'kirana', 'yajna'].includes(b.id)) -
        Number(['fransiska', 'kirana', 'yajna'].includes(a.id)),
    );
  if (automaticTutor) {
    document.getElementById('map').innerHTML =
      '<p>Tutor dipilih otomatis berdasarkan mata pelajaran, jenjang, dan ketersediaan jadwal. Pratinjau katalog demo; lokasi terdekat belum tersedia.</p>' +
      tutors
        .map(
          (t) =>
            `<div class="service-card"><b>${TutorDek.escape(t.name)}</b> · ${money(t.price)}/jam<br>${TutorDek.escape(t.modes.join(' / '))} · Jam WIB: ${t.slots.join(', ')}</div>`,
        )
        .join('');
    return;
  }
  const container = pages[2].querySelector('div[style*="overflow-x"]');
  const template =
    container.querySelector('.card-main')?.cloneNode(true) || tutorTemplate.cloneNode(true);
  container.replaceChildren();
  for (const tutor of tutors) {
    const card = template.cloneNode(true);
    card.querySelector('.anita-frens-hatipuan').textContent = tutor.name;
    card.querySelector('.description').textContent =
      `${tutor.subject} - ${selectedClass} · ${money(tutor.price)}/jam`;
    card.querySelector('.image-icon2').src = 'public/' + tutor.image;
    card.querySelector('.div').textContent = tutor.rating;
    const radio = card.querySelector('input');
    radio.id = 'tutor-' + tutor.id;
    radio.value = tutor.id;
    radio.checked = selectedTeacher === tutor.id;
    radio.onchange = () => {
      selectedTeacher = tutor.id;
      updateDisplay();
    };
    const label = card.querySelector('label');
    label.htmlFor = radio.id;
    label.textContent = 'Pilih ' + tutor.name;
    container.append(card);
  }
  if (!tutors.length)
    container.textContent =
      'Belum ada tutor untuk pilihan ini. Pilih mata pelajaran atau jenjang lain.';
}
const tutorTemplate = document.querySelector('.card-main')?.cloneNode(true);

async function finishProcess() {
  const button = document.querySelector('.selesai');
  if (button.disabled) return;
  button.disabled = true;
  try {
    if (!selectedPayment) throw new Error('Pilih metode pembayaran simulasi.');
    const user = await TutorDek.requireUser();
    if (!user) {
      sessionStorage.setItem(
        'tutordek-booking-draft',
        JSON.stringify({
          automaticTutor,
          selectedClass,
          selectedGrade,
          selectedLesson,
          selectedMaterial,
          selectedTeacher,
          selectedPlace,
          selectedAlamat,
          selectedDate,
          selectedTime,
          selectedPayment,
          promo: document.getElementById('bookingPromo').value,
        }),
      );
      return;
    }
    if (!bookingId) {
      const booking = await TutorDek.request('bookings', {
        level: selectedClass,
        grade: Number(selectedGrade),
        subject: selectedLesson,
        topic: selectedMaterial,
        tutorId: automaticTutor ? 'auto' : selectedTeacher,
        mode: selectedPlace,
        address: selectedAlamat,
        date: selectedDate,
        hour: Number(selectedTime.slice(0, 2)),
        promo: document.getElementById('bookingPromo').value,
      });
      bookingId = booking.id;
      prevButton.disabled = true;
    }
    const booking = await TutorDek.request(`bookings/${bookingId}/pay`, {
      method: ['Gopay', 'Ovo'].includes(selectedPayment) ? 'Demo e-wallet' : 'Demo bank',
    });
    const tutor = catalogue.tutors.find((t) => t.id === booking.tutor_id);
    const content = TutorDek.modal(
      'Pemesanan tersimpan',
      `<p>Simulasi pembayaran berhasil. Tidak ada uang yang ditagih.</p><p><b>${TutorDek.escape(tutor.name)}</b> · ${TutorDek.escape(selectedDate)} ${TutorDek.escape(selectedTime)} WIB · ${money(booking.total)}</p><p>Nomor pemesanan: ${TutorDek.escape(booking.id)}</p><button type="button" class="service-button" id="openBookings">Lihat sesi saya</button>`,
    );
    content.querySelector('button').onclick = () => TutorDek.openFeature('progresstracking');
    button.textContent = 'Pemesanan sudah tersimpan';
    sessionStorage.removeItem('tutordek-booking-draft');
  } catch (error) {
    button.disabled = false;
    TutorDek.status(pages[4], error.message, true);
  } finally {
    if (!bookingId) button.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  nextButton.setAttribute('aria-label', 'Langkah berikutnya');
  prevButton.setAttribute('aria-label', 'Langkah sebelumnya');
  document.querySelector('.back').setAttribute('aria-label', 'Kembali ke beranda');
  prevButton.onclick = showPreviousPage;
  const next = nextButton;
  next.onclick = async () => {
    next.disabled = true;
    try {
      await showNextPage();
    } catch (error) {
      TutorDek.status(pages[currentStep], error.message, true);
    } finally {
      next.disabled = false;
      next.hidden = currentStep === 4;
    }
  };
  for (const select of document.querySelectorAll('select'))
    select.setAttribute(
      'aria-label',
      {
        'form-select': 'Jenjang',
        'form-lesson': 'Mata pelajaran',
        'form-material': 'Materi',
        'form-place': 'Metode',
      }[select.className] || 'Pilihan',
    );
  // Never collect actual payment credentials for a demo checkout.
  document.getElementById('ewalletFormControl').remove();
  document.getElementById('debitFormControl').remove();
  const info = document.createElement('p');
  info.textContent =
    'Pembayaran simulasi. Jangan masukkan nomor kartu, rekening, atau dompet digital.';
  pages[4].prepend(info);
  const promo = document.createElement('label');
  promo.innerHTML =
    'Kode promo (opsional)<input id="bookingPromo" type="text" maxlength="30" class="form-email" placeholder="BELAJAR20">';
  pages[4].querySelector('.dropdown').after(promo);
  const price = document.createElement('li');
  price.id = 'selectedPrice';
  price.className = 'list-group-item';
  pages[4].querySelector('ul.list-group').append(price);
  document.getElementById('bookingPromo').value = sessionStorage.getItem('tutordek-promo') || '';
  document.getElementById('bookingPromo').oninput = updateDisplay;
  document.querySelector('.form-date').min = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const time = document.querySelector('.form-time');
  time.min = '08:00';
  time.max = '20:00';
  time.step = 3600;
  time.parentElement.querySelector('label[for="exampleFormControlInput3"]').textContent =
    'Jam mulai (WIB, durasi 60 menit)';
  document.querySelector('.form-select').onchange = (event) => {
    selectedClass = event.target.value;
    selectedGrade = '';
    selectedTeacher = '';
    const grades = { SD: [1, 2, 3, 4, 5, 6], SMP: [7, 8, 9], SMA: [10, 11, 12] };
    document.querySelector('.btn-group').innerHTML = (grades[selectedClass] || [])
      .map(
        (grade) =>
          `<input class="btn-check" type="radio" name="btnradio" id="btnradio${grade}" value="${grade}"><label class="btn btn-outline-primary" for="btnradio${grade}">${grade}</label>`,
      )
      .join('');
    document
      .querySelectorAll('.btn-check')
      .forEach((radio) => (radio.onchange = () => (selectedGrade = radio.value)));
  };
  document.querySelector('.form-lesson').onchange = (event) => {
    selectedLesson = event.target.value;
    selectedMaterial = '';
    selectedTeacher = '';
    document.querySelector('.form-material').innerHTML =
      '<option value="">Pilih Materi</option>' +
      catalogue.lessons
        .filter((l) => l.subject === selectedLesson)
        .map((l) => `<option value="${l.id}">${TutorDek.escape(l.title)}</option>`)
        .join('');
  };
  document.querySelector('.form-material').onchange = (event) =>
    (selectedMaterial = event.target.value);
  document.querySelector('.form-place').onchange = (event) => {
    selectedPlace = event.target.value;
    document.getElementById('offlineFormControl').style.display =
      selectedPlace === 'Offline' ? 'block' : 'none';
    document.getElementById('onlineFormControl').style.display = selectedPlace ? 'block' : 'none';
  };
  document.querySelector('.form-alamat').oninput = (event) => (selectedAlamat = event.target.value);
  document.querySelector('.form-date').onchange = (event) => (selectedDate = event.target.value);
  time.onchange = (event) => (selectedTime = event.target.value);
  document.querySelectorAll('.dropdown-item').forEach(
    (item) =>
      (item.onclick = (event) => {
        event.preventDefault();
        selectedPayment = item.textContent.trim();
        document.querySelector('.dropdown-toggle').textContent = selectedPayment + ' (simulasi)';
      }),
  );
  showPage(0);
  next.disabled = true;
  try {
    catalogue = await TutorDek.request('catalogue');
    const subjects = document.querySelector('.form-lesson');
    for (const name of Object.keys(catalogue.subjects)) {
      if (![...subjects.options].some((option) => option.value === name)) {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        subjects.append(option);
      }
    }
    const preset = catalogue.tutors.find(
      (t) => t.id === new URLSearchParams(location.search).get('tutor'),
    );
    if (preset && !automaticTutor) {
      const level = document.querySelector('.form-select');
      level.value = preset.levels[0];
      level.onchange({ target: level });
      subjects.value = preset.subject;
      subjects.onchange({ target: subjects });
      selectedTeacher = preset.id;
    }
    const { user } = await TutorDek.request('me');
    if (user) {
      document.querySelector('.form-email').value = user.email;
      document.querySelector('.form-email').readOnly = true;
    } else pages[4].querySelector('.form-email').placeholder = 'Masuk untuk menyimpan pemesanan';
    next.disabled = false;
    const saved = sessionStorage.getItem('tutordek-booking-draft');
    let draft;
    try {
      draft = saved ? JSON.parse(saved) : null;
    } catch {
      sessionStorage.removeItem('tutordek-booking-draft');
    }
    if (user && draft && draft.automaticTutor === automaticTutor) {
      const level = document.querySelector('.form-select');
      level.value = draft.selectedClass;
      level.onchange({ target: level });
      selectedGrade = draft.selectedGrade;
      const grade = document.getElementById('btnradio' + selectedGrade);
      if (grade) grade.checked = true;
      const subject = document.querySelector('.form-lesson');
      subject.value = draft.selectedLesson;
      subject.onchange({ target: subject });
      selectedMaterial = draft.selectedMaterial;
      document.querySelector('.form-material').value = selectedMaterial;
      selectedTeacher = draft.selectedTeacher;
      renderTutors();
      const mode = document.querySelector('.form-place');
      mode.value = draft.selectedPlace;
      mode.onchange({ target: mode });
      selectedAlamat = draft.selectedAlamat;
      document.querySelector('.form-alamat').value = selectedAlamat;
      selectedDate = draft.selectedDate;
      document.querySelector('.form-date').value = selectedDate;
      selectedTime = draft.selectedTime;
      time.value = selectedTime;
      selectedPayment = draft.selectedPayment;
      document.querySelector('.dropdown-toggle').textContent = selectedPayment + ' (simulasi)';
      document.getElementById('bookingPromo').value = draft.promo;
      updateDisplay();
      showPage(3);
      TutorDek.status(
        pages[3],
        'Pilihan sebelumnya dipulihkan. Periksa kembali jadwal sebelum melanjutkan.',
      );
    }
  } catch (error) {
    TutorDek.status(pages[0], error.message, true);
  }
});
