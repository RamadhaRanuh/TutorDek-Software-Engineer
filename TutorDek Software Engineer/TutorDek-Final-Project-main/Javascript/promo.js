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