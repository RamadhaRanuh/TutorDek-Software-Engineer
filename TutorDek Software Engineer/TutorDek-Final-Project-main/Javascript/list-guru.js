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