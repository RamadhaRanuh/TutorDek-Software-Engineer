const h1=document.querySelector("#videoSoal");
const h2=document.querySelector("#videoSoalDesc")

document.querySelector("#videosoal").onclick = function(){
    h1.innerText = 'Video & Soal';
    h2.innerText = 'Akses ratusan ribu video pembelajaran dan soal latihan yang siap mendampingi belajar konsep-konsep secara fleksibel, kapan pun dan di mana pun kamu berada.';
}

document.querySelector("#tryout").onclick = function(){
    h1.innerText = 'TryOut';
    h2.innerText = 'Persiapkan dirimu dengan tryout berkualitas tinggi untuk menguji kemampuanmu dan meningkatkan prestasimu dalam berbagai bidang.';
}

document.querySelector("#livetutor").onclick = function(){
    h1.innerText = 'Live Tutor';
    h2.innerText = 'Dapatkan pengalaman belajar yang interaktif dengan live tutor berpengalaman yang akan membimbingmu dalam memahami konsep-konsep secara mendalam.';
}

document.querySelector("#robottutor").onclick = function(){
    h1.innerText = 'Robot Tutor';
    h2.innerText = 'Jelajahi dunia pembelajaran yang futuristik dengan robot tutor yang cerdas, memberikan penjelasan lengkap dan latihan yang disesuaikan dengan kebutuhanmu.';
}

document.querySelector("#brainboost").onclick = function(){
    h1.innerText = 'BrainBoost';
    h2.innerText = 'Optimalkan potensimu dengan Brainboost, metode pembelajaran yang dirancang khusus untuk meningkatkan konsentrasi, memori, dan kemampuan pemecahan masalah.';
}

document.querySelector("#progresstracking").onclick = function(){
    h1.innerText = 'Progress Tracking';
    h2.innerText = 'Pantau perkembanganmu secara real-time dengan fitur progress tracking, sehingga kamu dapat melihat kemajuan yang telah dicapai dan menetapkan target belajar yang lebih efektif.';
}

document.querySelector("#forumdiscussion").onclick = function(){
    h1.innerText = 'Forum Discussion';
    h2.innerText = 'Terhubunglah dengan komunitas pembelajar kami melalui forum discussion, berbagi ide, bertanya, dan menjawab pertanyaan untuk memperluas pemahamanmu dengan perspektif yang berbeda.';
}