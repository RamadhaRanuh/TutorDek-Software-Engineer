var faqItems = document.querySelectorAll('.faq-accordian-item-wrap1');

faqItems.forEach(function(item) {
  item.addEventListener('click', function() {
    this.classList.toggle('opened');

    var contentDiv1 = this.querySelector('#faq1');
    var contentDiv2 = this.querySelector('#faq2');
    var contentDiv3 = this.querySelector('#faq3');
    var contentDiv4 = this.querySelector('#faq4');
    var contentDiv5 = this.querySelector('#faq5');
    var contentDiv6 = this.querySelector('#faq6');
    var contentDiv7 = this.querySelector('#faq7');
    var contentDiv8 = this.querySelector('#faq8');
    var contentDiv9 = this.querySelector('#faq9');


    var additionalContent1 = "Untuk mendaftar di TutorDek, cukup kunjungi situs web kami dan klik tombol 'Daftar'. Isi formulir pendaftaran dengan informasi yang diperlukan dan ikuti langkah-langkah yang diberikan.";
    var additionalContent2 = "Kami bekerja sama dengan tutor yang telah melalui proses verifikasi dan memiliki kualifikasi yang baik. Meskipun kami tidak menyediakan jaminan kesehatan, kami memastikan tutor yang terdaftar di platform kami telah melalui seleksi ketat.";
    var additionalContent3 = "TutorDek menawarkan berbagai metode pembelajaran, termasuk pengajaran tatap muka, pembelajaran online melalui video conference, dan juga dapat memanfaatkan materi pembelajaran yang disediakan dalam format digital.";
    var additionalContent4 = "TutorDek memiliki sistem penilaian dan evaluasi yang transparan. Setelah setiap sesi pembelajaran, Anda dapat memberikan ulasan dan penilaian terhadap tutor. Hal ini membantu kami memastikan kualitas pengajaran yang berkualitas tinggi.";
    var additionalContent5 = "Ya, TutorDek menyediakan fitur bantuan tutor pribadi. Anda dapat memilih tutor yang paling sesuai dengan kebutuhan Anda dan bekerja dengannya secara teratur untuk membantu mencapai tujuan belajar Anda.";
    var additionalContent6 = "Biaya langganan dan harga layanan di TutorDek bervariasi tergantung pada kualifikasi dan pengalaman tutor yang dipilih. Kami menawarkan berbagai paket dan opsi harga yang dapat disesuaikan dengan kebutuhan dan anggaran Anda.";
    var additionalContent7 = "Anda dapat mengakses materi pembelajaran di TutorDek setelah Anda melakukan pendaftaran dan menjadi anggota. Setelah itu, Anda akan memiliki akses ke beragam materi pembelajaran yang relevan dan bermanfaat.";
    var additionalContent8 = "Untuk memesan pembelajaran secara offline di TutorDek, Anda dapat menggunakan fitur pencarian kami untuk menemukan tutor yang menyediakan layanan pembelajaran tatap muka. Setelah itu, Anda dapat menghubungi tutor tersebut dan menentukan jadwal dan lokasi pertemuan secara langsung dengan mereka.";
    var additionalContent9 = "Jika Anda lupa password akun TutorDek, jangan khawatir! Anda dapat menggunakan fitur pemulihan password yang ada di halaman masuk. Klik opsi 'Lupa Password' dan ikuti langkah-langkah yang diberikan. Anda akan diminta untuk memasukkan alamat email yang terhubung dengan akun Anda. Setelah itu, Anda akan menerima instruksi melalui email tentang cara mengatur ulang password Anda. Pastikan untuk memeriksa folder 'Spam' atau 'Promosi' jika email tidak muncul di kotak masuk utama. Jika Anda mengalami masalah lebih lanjut, jangan ragu untuk menghubungi tim dukungan kami yang siap membantu Anda mengatasi masalah tersebut."

    if (this.classList.contains('opened')) {
      if(contentDiv1){
        contentDiv1.innerHTML = additionalContent1;
      }
      else if(contentDiv2){
        contentDiv2.innerHTML = additionalContent2;
      }
      else if(contentDiv3){
        contentDiv3.innerHTML = additionalContent3;
      }
      else if(contentDiv4){
        contentDiv4.innerHTML = additionalContent4;
      }
      else if(contentDiv5){
        contentDiv5.innerHTML = additionalContent5;
      }
      else if(contentDiv6){
        contentDiv6.innerHTML = additionalContent6;
      }
      else if(contentDiv7){
        contentDiv7.innerHTML = additionalContent7;
      }
      else if(contentDiv8){
        contentDiv8.innerHTML = additionalContent8;
      }
      else{
        contentDiv9.innerHTML = additionalContent9;
      }
    } 
    else{
      if(contentDiv1){
        contentDiv1.innerHTML = '';
      }
      else if(contentDiv2){
        contentDiv2.innerHTML = '';
      }
      else if(contentDiv3){
        contentDiv3.innerHTML = '';
      }
      else if(contentDiv4){
        contentDiv4.innerHTML = '';
      }
      else if(contentDiv5){
        contentDiv5.innerHTML = '';
      }
      else if(contentDiv6){
        contentDiv6.innerHTML = '';
      }
      else if(contentDiv7){
        contentDiv7.innerHTML = '';
      }
      else if(contentDiv8){
        contentDiv8.innerHTML = '';
      }
      else{
        contentDiv9.innerHTML = '';
      }

    }
  });
});

