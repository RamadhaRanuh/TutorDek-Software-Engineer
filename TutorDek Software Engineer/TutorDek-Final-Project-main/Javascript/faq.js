const faqAnswers = [
  'Klik Masuk lalu Daftar. Isi nama, email, dan password minimal 10 karakter. Akun disimpan di server lokal TutorDek.',
  'Profil tutor pada proyek ini adalah katalog contoh. Verifikasi tutor dan layanan pertemuan nyata belum dikonfigurasi.',
  'Pilih Online atau Offline pada pemesanan. Jadwal dan alamat offline dapat disimpan; panggilan video belum terhubung.',
  'Setelah jadwal sesi berakhir, buka Akun Saya, selesaikan sesi, lalu kirim rating dan ulasan. Ulasan tersimpan di server.',
  'Pilih tutor dari kartu profil atau gunakan pencocokan otomatis menurut mata pelajaran, jenjang, dan jadwal yang tersedia.',
  'Harga per sesi dan diskon tampil sebelum konfirmasi. Pembayaran merupakan simulasi; langganan paket berbayar belum aktif.',
  'Buka Fitur lalu Video & Soal atau E-Book untuk membaca materi contoh orisinal TutorDek. Masuk untuk menyimpan kemajuan.',
  'Pilih Offline, masukkan alamat minimal 10 karakter, tanggal, dan jam WIB. Ketersediaan diperiksa kembali sebelum pemesanan.',
  'Pengiriman email pemulihan password belum dikonfigurasi. Google login juga belum tersedia; gunakan akun email dan password.',
];
document.querySelectorAll('.faq-accordian-item-wrap1').forEach((item, index) => {
  const answer = item.querySelector('[id^="faq"]');
  if (!answer) return;
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-expanded', 'false');
  item.setAttribute('aria-controls', answer.id);
  item.onclick = () => {
    const expanded = item.classList.toggle('opened');
    item.setAttribute('aria-expanded', expanded);
    answer.textContent = expanded ? faqAnswers[index] : '';
  };
  item.onkeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      item.click();
    }
  };
});
