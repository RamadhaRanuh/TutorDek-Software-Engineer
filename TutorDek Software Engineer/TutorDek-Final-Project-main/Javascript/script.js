const h1=document.querySelector("#videoSoal");

document.querySelector("#videosoal").onclick = function(){
    h1.innerText = 'Video & Soal';
}

document.querySelector("#tryout").onclick = function(){
    h1.innerText = 'TryOut';
}

document.querySelector("#livetutor").onclick = function(){
    h1.innerText = 'Live Tutor';
}

document.querySelector("#robottutor").onclick = function(){
    h1.innerText = 'Robot Tutor';
}

document.querySelector("#brainboost").onclick = function(){
    h1.innerText = 'BrainBoost';
}

document.querySelector("#progresstracking").onclick = function(){
    h1.innerText = 'Progress Tracking';
}

document.querySelector("#forumdiscussion").onclick = function(){
    h1.innerText = 'Forum Discussion';
}



var faqItems = document.querySelectorAll('.faq-accordian-item-wrap1');

faqItems.forEach(function(item) {
  item.addEventListener('click', function() {
    this.classList.toggle('opened');

    var contentDiv = this.querySelector('.text103');

    var additionalContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.";

    if (this.classList.contains('opened')) {
      contentDiv.innerHTML = additionalContent;
    } 
    else{
        contentDiv.innerHTML = '';
    }
  });
});



const promoList = document.querySelector('.cardstuff');
const leftBtn = document.querySelector('.button999 img[src="./public/vuesaxlineararrowleft.svg"]');
const rightBtn = document.querySelector('.button999 img[src="./public/vuesaxlineararrowright.svg"]');
const sliderbar = document.querySelectorAll('.slider-bar-item');
i=0;

const promoSlotWidth = 540;

leftBtn.addEventListener('click', moveLft);
rightBtn.addEventListener('click', moveRght);

function moveLft() {

    promoList.scrollBy({
        top: 0,
        left: -promoSlotWidth,
        behavior: 'smooth'
    });

    if(i===0){
      return;
    }
    else{
      sliderbar[i].classList.remove('slider-bar-child');
      sliderbar[i].classList.add('slider-bar-item');
      sliderbar[i-1].classList.remove('slider-bar-item');
      sliderbar[i-1].classList.add('slider-bar-child');
      i--;
    }

}

function moveRght() {
    promoList.scrollBy({
        top: 0,
        left: promoSlotWidth,
        behavior: 'smooth'
    });

    if(i===2){
      return;
    }
    else{
      sliderbar[i].classList.remove('slider-bar-child');
      sliderbar[i].classList.add('slider-bar-item');
      sliderbar[i+1].classList.remove('slider-bar-item');
      sliderbar[i+1].classList.add('slider-bar-child');
      i++;
    }
}




const cardList = document.querySelector('.cardlist');
const leftButton = document.querySelector('.button123 img[src="./public/vuesaxlineararrowleft1.svg"]');
const rightButton = document.querySelector('.button123 img[src="./public/vuesaxlineararrowright2.svg"]');
const paginationItems = document.querySelectorAll('.pagination-item');
j = 0;

const cardSlotWidth = 1300;

leftButton.addEventListener('click', moveLeft);
rightButton.addEventListener('click', moveRight);

function moveLeft() {

    cardList.scrollBy({
        top: 0,
        left: -cardSlotWidth,
        behavior: 'smooth'
    });

    if(j===0){
      return;
    }
    else{
      paginationItems[j].classList.remove('pagination-child');
      paginationItems[j].classList.add('pagination-item');
      paginationItems[j-1].classList.remove('pagination-item');
      paginationItems[j-1].classList.add('pagination-child');
      j--;
    }
}

function moveRight() {
    cardList.scrollBy({
        top: 0,
        left: cardSlotWidth,
        behavior: 'smooth'
    });

    if(j===5){
      return;
    }
    else{
      paginationItems[j].classList.remove('pagination-child');
      paginationItems[j].classList.add('pagination-item');
      paginationItems[j+1].classList.remove('pagination-item');
      paginationItems[j+1].classList.add('pagination-child');
      j++;
    }
}



function generateGradeButton(grade) {
    return '<button class="default-tabs2 grade-button">' + grade + '</button>';
  }
  
  document.querySelector("#sd").onclick = function () {
    const slots = document.querySelectorAll('.tabs-kelas div');
    
    slots.forEach((slot, index) => {
      if (index < 6) {
          slot.innerHTML = generateGradeButton(index  + 1);
        }; 
        });
      }
  
  
  document.querySelector("#smp").onclick = function () {
    const slots = document.querySelectorAll('.tabs-kelas div');
    
    slots.forEach((slot, index) => {
      if (index < 6) {
        if (index === 0) {
          slot.innerHTML = generateGradeButton(7);
        } else if (index === 2) {
          slot.innerHTML = generateGradeButton(8);
        } else if (index === 4) {
          slot.innerHTML = generateGradeButton(9);
        } else {
          slot.innerHTML = '';
        }
      }
    });
  };
  
  document.querySelector("#sma").onclick = function () {
    const slots = document.querySelectorAll('.tabs-kelas div');
    
    slots.forEach((slot, index) => {
      if (index < 6) {
        if (index === 0) {
          slot.innerHTML = generateGradeButton(10);
        } else if (index === 2) {
          slot.innerHTML = generateGradeButton(11);
        } else if (index === 4) {
          slot.innerHTML = generateGradeButton(12);
        } else {
          slot.innerHTML = '';
        }
      }
    });
  };
  
  document.addEventListener('click', function (event) {
    if (event.target.matches('.grade-button')) {
      const selectedGrade = event.target.textContent;
      console.log('Grade ' + selectedGrade + ' button clicked.');
    }
  });
  

  function togglePopup() {
    const popup = document.getElementById("popup-1");
    const body = document.body;
    
    popup.classList.toggle("active");
    body.classList.toggle("popup-active");
  }

  function toggleFitur() {
    const popup = document.getElementById("popupFitur");
    const body = document.body;
    
    popup.classList.toggle("active");
    body.classList.toggle("popup-active");
  }









