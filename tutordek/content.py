"""Original learning content and explicitly marked demonstration catalogues."""

SUBJECTS = {
    "Matematika": ["bilangan", "aljabar", "pythagoras"],
    "Inggris": ["english"], "Sains": ["sains"],
    "Fisika": ["gerak"], "Biologi": ["sel"],
    "Kimia": ["atom"], "Mandarin": ["mandarin"],
}

LESSONS = [
    {"id": "bilangan", "subject": "Matematika", "title": "Bilangan bulat, langkah demi langkah", "level": "SD", "minutes": 10,
     "keywords": ["bilangan", "bulat", "negatif", "positif", "integer", "tambah"],
     "sections": [["Kenali garis bilangan", "Bilangan bulat meliputi bilangan negatif, nol, dan positif. Pada garis bilangan, angka yang lebih ke kanan selalu lebih besar. Contohnya, -2 lebih besar daripada -5."], ["Penjumlahan dan pengurangan", "Mulai dari angka pertama. Menambah angka positif berarti bergerak ke kanan; menguranginya berarti bergerak ke kiri. Contoh: -3 + 5 = 2, karena kita bergerak lima langkah ke kanan dari -3."], ["Coba sendiri", "Suhu pagi adalah -2°C dan naik 7°C. Suhu akhirnya 5°C. Untuk memeriksa jawaban, gambarkan tujuh langkah ke kanan pada garis bilangan."]],
     "questions": [["Berapa hasil -3 + 5?", ["-8", "2", "8", "-2"], 1, "Dari -3, bergerak lima langkah ke kanan sampai 2."], ["Bilangan mana yang paling besar?", ["-9", "-1", "0", "4"], 3, "4 berada paling kanan pada garis bilangan."]]},
    {"id": "aljabar", "subject": "Matematika", "title": "Aljabar tanpa rasa takut", "level": "SMP", "minutes": 12,
     "keywords": ["aljabar", "algebra", "persamaan", "variabel", "linear"],
     "sections": [["Apa itu variabel?", "Variabel adalah simbol untuk nilai yang belum diketahui. Dalam x + 3 = 8, x mewakili angka yang membuat persamaan benar."], ["Jaga keseimbangan", "Lakukan operasi yang sama pada kedua ruas. Dari x + 3 = 8, kurangi kedua ruas dengan 3 sehingga x = 5. Dari 2x = 10, bagi kedua ruas dengan 2 sehingga x = 5."], ["Periksa solusi", "Masukkan hasil kembali ke persamaan awal. Untuk 3x + 2 = 14, x = 4 memberi 3 × 4 + 2 = 14, sehingga jawabannya benar."]],
     "questions": [["Jika 2x + 4 = 12, berapa x?", ["2", "4", "6", "8"], 1, "Kurangi 4 dari kedua ruas lalu bagi 2: x = 4."], ["Manakah yang merupakan variabel?", ["7", "+", "x", "="], 2, "x adalah simbol yang mewakili nilai."]]},
    {"id": "pythagoras", "subject": "Matematika", "title": "Mengenal teorema Pythagoras", "level": "SMP", "minutes": 15,
     "keywords": ["pythagoras", "segitiga", "triangle", "siku", "hipotenusa"],
     "sections": [["Segitiga siku-siku", "Teorema Pythagoras berlaku pada segitiga yang memiliki sudut 90°. Sisi di depan sudut siku-siku disebut hipotenusa dan merupakan sisi terpanjang."], ["Rumus dan contoh", "Jika a dan b adalah sisi siku-siku dan c adalah hipotenusa, a² + b² = c². Untuk a = 3 dan b = 4, c² = 9 + 16 = 25 sehingga c = 5."], ["Gunakan dengan tepat", "Tangga bersandar pada dinding. Kaki tangga berjarak 6 meter dari dinding dan puncaknya 8 meter di atas tanah. Panjang tangga adalah √(36 + 64) = 10 meter."]],
     "questions": [["Sisi siku-siku 6 dan 8. Berapa hipotenusanya?", ["10", "12", "14", "48"], 0, "6² + 8² = 100, sehingga c = 10."], ["Pythagoras berlaku pada segitiga ...", ["semua jenis", "sama sisi", "siku-siku", "tumpul"], 2, "Syaratnya adalah satu sudut sebesar 90°."]]},
    {"id": "english", "subject": "Inggris", "title": "Simple present untuk keseharian", "level": "SMP", "minutes": 10,
     "keywords": ["english", "inggris", "present", "grammar", "verb"],
     "sections": [["Kebiasaan dan fakta", "Simple present digunakan untuk kebiasaan dan fakta. Contoh: I study every day. The sun rises in the east."], ["He, she, it", "Tambahkan -s atau -es pada kata kerja untuk he, she, dan it. I read menjadi she reads. I go menjadi he goes."], ["Pertanyaan dan negasi", "Gunakan do atau does. Do you study? Does she study? Pada pertanyaan dengan does, study tidak memakai -s. Negasi: She does not study on Sunday."]],
     "questions": [["Pilih kalimat yang benar.", ["She read daily.", "She reads daily.", "She reading daily.", "She do reads daily."], 1, "Subjek she memakai kata kerja reads."], ["Lengkapi: Does he ___ here?", ["works", "working", "work", "worked"], 2, "Setelah does, gunakan bentuk dasar work."]]},
    {"id": "sains", "subject": "Sains", "title": "Siklus air di sekitar kita", "level": "SD", "minutes": 8,
     "keywords": ["air", "sains", "hujan", "siklus", "evaporasi", "kondensasi"],
     "sections": [["Penguapan", "Panas matahari mengubah air cair menjadi uap. Proses ini disebut evaporasi. Air dari laut, danau, dan sungai dapat menguap."], ["Awan dan hujan", "Uap air mendingin dan menjadi titik air melalui kondensasi. Titik-titik air membentuk awan. Saat cukup berat, air turun sebagai presipitasi, misalnya hujan."], ["Kembali ke bumi", "Air hujan meresap ke tanah atau mengalir ke sungai dan laut. Siklus ini berulang dan membantu menjaga ketersediaan air."]],
     "questions": [["Perubahan uap air menjadi titik air disebut ...", ["evaporasi", "kondensasi", "pembakaran", "pembekuan"], 1, "Kondensasi terjadi ketika uap air mendingin."], ["Sumber energi utama siklus air adalah ...", ["bulan", "matahari", "angin saja", "tanah"], 1, "Panas matahari mendorong penguapan."]]},
    {"id": "gerak", "subject": "Fisika", "title": "Kecepatan dan gerak lurus", "level": "SMA", "minutes": 12,
     "keywords": ["fisika", "gerak", "kecepatan", "jarak", "waktu", "velocity"],
     "sections": [["Jarak dan waktu", "Kelajuan rata-rata adalah total jarak dibagi total waktu. Untuk perjalanan 120 km selama 2 jam, kelajuannya 60 km/jam."], ["Kecepatan berbeda dari kelajuan", "Kecepatan memperhatikan arah perpindahan, sedangkan kelajuan hanya besarnya. Berjalan kembali ke titik awal menghasilkan perpindahan nol, walaupun jarak yang ditempuh tidak nol."], ["Satuan", "Satuan SI kelajuan adalah meter per sekon. Untuk mengubah km/jam menjadi m/s, bagi dengan 3,6. Jadi 36 km/jam sama dengan 10 m/s."]],
     "questions": [["Jarak 100 m ditempuh dalam 20 s. Kelajuannya?", ["2 m/s", "5 m/s", "20 m/s", "2000 m/s"], 1, "100 dibagi 20 sama dengan 5 m/s."], ["36 km/jam sama dengan ...", ["1 m/s", "3,6 m/s", "10 m/s", "36 m/s"], 2, "Bagi 36 dengan 3,6."]]},
    {"id": "sel", "subject": "Biologi", "title": "Sel: unit dasar kehidupan", "level": "SMA", "minutes": 10,
     "keywords": ["biologi", "sel", "cell", "nukleus", "mitokondria"],
     "sections": [["Bagian utama sel", "Membran sel membatasi sel dan mengatur pertukaran zat. Sitoplasma adalah tempat banyak reaksi berlangsung. Pada sel eukariotik, nukleus menyimpan sebagian besar informasi genetik."], ["Organel", "Mitokondria berperan dalam menghasilkan ATP melalui respirasi sel. Ribosom menyusun protein. Kloroplas pada sel tumbuhan menjalankan fotosintesis."], ["Tumbuhan dan hewan", "Sel tumbuhan memiliki dinding sel dan biasanya vakuola besar. Sel hewan tidak memiliki dinding sel. Keduanya memiliki membran sel dan ribosom."]],
     "questions": [["Organel yang menyusun protein adalah ...", ["ribosom", "vakuola", "dinding sel", "kloroplas"], 0, "Ribosom adalah tempat sintesis protein."], ["Fotosintesis berlangsung di ...", ["nukleus", "kloroplas", "membran", "ribosom"], 1, "Kloroplas mengandung pigmen untuk fotosintesis."]]},
    {"id": "atom", "subject": "Kimia", "title": "Struktur atom dan nomor atom", "level": "SMA", "minutes": 10,
     "keywords": ["kimia", "atom", "proton", "neutron", "elektron"],
     "sections": [["Partikel penyusun", "Inti atom berisi proton bermuatan positif dan neutron netral. Elektron bermuatan negatif berada di sekitar inti."], ["Nomor atom", "Nomor atom adalah jumlah proton. Atom netral memiliki jumlah elektron sama dengan jumlah proton. Karbon bernomor atom 6 memiliki 6 proton."], ["Nomor massa", "Nomor massa adalah jumlah proton ditambah neutron. Jika atom memiliki 6 proton dan 8 neutron, nomor massanya 14. Isotop memiliki jumlah proton sama dan neutron berbeda."]],
     "questions": [["Nomor atom ditentukan oleh jumlah ...", ["neutron", "proton", "proton + neutron", "kulit"], 1, "Jumlah proton menentukan unsur."], ["6 proton dan 8 neutron memberi nomor massa ...", ["2", "6", "8", "14"], 3, "Nomor massa = 6 + 8 = 14."]]},
    {"id": "mandarin", "subject": "Mandarin", "title": "Sapaan pertama dalam Mandarin", "level": "SMP", "minutes": 8,
     "keywords": ["mandarin", "sapaan", "nihao", "pinyin", "bahasa"],
     "sections": [["Sapaan", "你好 ditulis nǐ hǎo dalam pinyin dan berarti halo. 谢谢 (xièxie) berarti terima kasih. 再见 (zàijiàn) berarti sampai jumpa."], ["Pinyin dan nada", "Pinyin membantu membaca bunyi bahasa Mandarin. Tanda di atas vokal menandai nada. Nada dapat membedakan makna, sehingga perlu dilatih bersama pelafalan."], ["Latihan kecil", "Coba tulis percakapan singkat: Nǐ hǎo! Nǐ hǎo! Xièxie. Zàijiàn. Bacalah perlahan sambil memperhatikan tanda nada."]],
     "questions": [["Xièxie berarti ...", ["halo", "sampai jumpa", "terima kasih", "selamat malam"], 2, "谢谢 (xièxie) berarti terima kasih."], ["Pinyin membantu membaca ...", ["bunyi bahasa", "nomor atom", "persamaan", "jarak"], 0, "Pinyin adalah sistem penulisan bunyi."]]},
]

TUTORS = [
    {"id": "anita", "name": "Anita Frens Hatipuan", "subject": "Matematika", "levels": ["SMA"], "rating": 4.8, "price": 85000, "years": 6, "qualification": "Pendidikan Matematika", "image": "image2@2x.png", "modes": ["Online", "Offline"], "city": "Jakarta", "slots": [9, 11, 14, 16, 19]},
    {"id": "bella", "name": "Bella Sihombing", "subject": "Fisika", "levels": ["SMA"], "rating": 4.7, "price": 90000, "years": 5, "qualification": "Pendidikan Fisika", "image": "image3@2x.png", "modes": ["Online"], "city": "Bandung", "slots": [10, 13, 15, 18]},
    {"id": "dessy", "name": "Dessy Sariwati", "subject": "Matematika", "levels": ["SMP"], "rating": 4.8, "price": 70000, "years": 4, "qualification": "Pendidikan Matematika", "image": "image4@2x.png", "modes": ["Online", "Offline"], "city": "Jakarta", "slots": [9, 11, 14, 16, 19]},
    {"id": "rizky", "name": "Rizky Pratama", "subject": "Biologi", "levels": ["SMA"], "rating": 4.6, "price": 80000, "years": 4, "qualification": "Pendidikan Biologi", "image": "image5@2x.png", "modes": ["Online"], "city": "Surabaya", "slots": [9, 13, 16, 19]},
    {"id": "ulil", "name": "Ulil Farauzi", "subject": "Mandarin", "levels": ["SMP", "SMA"], "rating": 4.7, "price": 95000, "years": 5, "qualification": "Pendidikan Bahasa Mandarin", "image": "image6@2x.png", "modes": ["Online"], "city": "Jakarta", "slots": [10, 14, 18]},
    {"id": "reni", "name": "Reni Putri L.", "subject": "Matematika", "levels": ["SD"], "rating": 4.8, "price": 65000, "years": 4, "qualification": "Pendidikan Guru Sekolah Dasar", "image": "teacherFemale.png", "modes": ["Online", "Offline"], "city": "Jakarta", "slots": [9, 11, 14, 16]},
    {"id": "olive", "name": "Olive Chen", "subject": "Kimia", "levels": ["SMA"], "rating": 4.4, "price": 80000, "years": 3, "qualification": "Pendidikan Kimia", "image": "teacherFemale.png", "modes": ["Online"], "city": "Bandung", "slots": [9, 13, 16, 19]},
    {"id": "ditto", "name": "Ditto Nugroho", "subject": "Fisika", "levels": ["SMA"], "rating": 4.9, "price": 100000, "years": 7, "qualification": "Pendidikan Fisika", "image": "teacherMale.png", "modes": ["Online", "Offline"], "city": "Jakarta", "slots": [9, 11, 14, 16, 19]},
    {"id": "maya", "name": "Maya Putri", "subject": "Inggris", "levels": ["SD", "SMP", "SMA"], "rating": 4.7, "price": 70000, "years": 4, "qualification": "Pendidikan Bahasa Inggris", "image": "teacherFemale.png", "modes": ["Online"], "city": "Jakarta", "slots": [9, 11, 14, 16, 19]},
    {"id": "bima", "name": "Bima Saputra", "subject": "Sains", "levels": ["SD", "SMP"], "rating": 4.6, "price": 65000, "years": 3, "qualification": "Pendidikan IPA", "image": "teacherMale.png", "modes": ["Online"], "city": "Bandung", "slots": [9, 11, 14, 16, 19]},
]

PACKAGES = [
    {"id": "dasar", "name": "Langkah Pertama", "description": "Bangun fondasi belajar dengan dua materi singkat.", "lessons": ["bilangan", "sains"], "level": "SD"},
    {"id": "smp", "name": "Siap Belajar SMP", "description": "Aljabar, geometri, dan bahasa untuk langkah berikutnya.", "lessons": ["aljabar", "pythagoras", "english"], "level": "SMP"},
    {"id": "sma", "name": "Eksplorasi Sains SMA", "description": "Pahami hubungan gerak, kehidupan, dan materi.", "lessons": ["gerak", "sel", "atom"], "level": "SMA"},
]

PROMOS = [{"code": "BELAJAR20", "percent": 20, "cap": 25000, "description": "Diskon 20% hingga Rp25.000 untuk setiap pemesanan demo."}]

def public_lesson(lesson):
    return {key: value for key, value in lesson.items() if key not in ("questions", "keywords")}

def quiz_questions(lesson_ids):
    result = []
    for lesson in LESSONS:
        if lesson["id"] in lesson_ids:
            for i, question in enumerate(lesson["questions"]):
                result.append({"id": f'{lesson["id"]}:{i}', "question": question[0], "options": question[1]})
    return result
