let progress = 0;
let selectedClass = '';
let selectedGrade = '';
let selectedLesson = '';
let selectedMaterial = '';
let selectedTeacher = "Anita Frens Hatipuan";
let selectedPlace = '';
let selectedAlamat = '';
let selectedDate = '';
let selectedEmail = '';
let selectedPayment = '';
let selectedTime = '';
let selectedEwallet = '';
let selectedDebit = '';
const radioButton = document.querySelectorAll('.card-main .form-teacher-input');



function validateForm() {
    const currentPage = document.querySelector('.page[style="display: block;"]');
    const select = currentPage.querySelector('.form-select');
    const lesson = currentPage.querySelector('.form-lesson');
    const material = currentPage.querySelector('.form-material');
    const teacher = currentPage.querySelector('.form-teacher');
    const place = currentPage.querySelector('.form-place');
    const payment = currentPage.querySelector('#paymentFormControl');

    // Check if we're on the class selection page
    if (select) {
        return selectedClass != '' && selectedGrade != '';
    }

    // Check if we're on the materials page
    if (material && lesson) {
        return selectedLesson != '' && selectedMaterial != '';
    }

    if (teacher){
        return selectedTeacher != '';
    }

    if (place){
        return selectedPlace != '' && ((selectedPlace == 'Offline' && selectedAlamat != '') || (selectedPlace == 'Online' && selectedDate != '' && selectedTime != ''));
    }

    if (payment) {
        return selectedEwallet != '' || selectedDebit != '';
    }

    // If we're on a different page, just return true
    return true;
}


document.querySelector('.form-select').addEventListener('change', function(e) {
    selectedClass = e.target.value;
    var btnGroup = document.querySelector('.btn-group');
    btnGroup.innerHTML = ''; // clear existing buttons

    var start, end;
    if (e.target.value == 'SD') { // SD
        start = 1;
        end = 6;
    } else if (e.target.value == 'SMP') { // SMP
        start = 7;
        end = 9;
    } else if (e.target.value == 'SMA') { // SMA
        start = 10;
        end = 12;
    }

    for (var i = start; i <= end; i++) {
        var input = document.createElement('input');
        input.type = 'radio';
        input.className = 'btn-check';
        input.name = 'btnradio';
        input.id = 'btnradio' + i;
        input.autocomplete = 'off';

        var label = document.createElement('label');
        label.className = 'btn btn-outline-primary';
        label.htmlFor = 'btnradio' + i;
        label.textContent = i;

        btnGroup.appendChild(input);
        btnGroup.appendChild(label);
    }

    // Set up event listeners for the radio buttons
    document.querySelectorAll('.btn-check').forEach(function(radio) {
        radio.addEventListener('click', function(e) {
            selectedGrade = e.target.id.replace('btnradio', '');
        });
    });
});

var materials = {
    'Matematika': ['Trigonometry', 'Algebra', 'Geometry'],
    'Inggris': ['Grammar', 'Composition', 'Literature'],
    'Sains': ['Physics', 'Chemistry', 'Biology']
  };

document.querySelector('.form-lesson').addEventListener('change', function(e) {
    selectedLesson = e.target.value;
    var materialSelect = document.querySelector('.form-material');

    materialSelect.innerHTML = '';

    materials[selectedLesson].forEach(function(material) {
        var option = document.createElement('option');
        option.value = material;
        option.textContent = material;
        materialSelect.appendChild(option);
    });
});

document.querySelector('.form-material').addEventListener('change', function(e) {
    selectedMaterial = e.target.selectedOptions[0].textContent;
});

radioButton.forEach(radioButton => {
    radioButton.addEventListener('change', function() {
        if (this.checked) {
            // Get the teacher name from the same card-main div
            const teacherName = this.parentElement.parentElement.querySelector('.anita-frens-hatipuan').textContent;
            selectedTeacher = teacherName;
        }
    });
});


document.querySelector('.form-place').addEventListener('change', function(e) {
    selectedPlace = e.target.value;
    document.getElementById('selectedDetail').textContent = selectedPlace == 'Offline' ? selectedAlamat : selectedDate;
});


document.querySelector('#offlineFormControl .form-alamat').addEventListener('change', function(e) {
    selectedAlamat = e.target.value;
    document.getElementById('selectedDetail').textContent = 'Alamat: ' + selectedAlamat;
});

document.querySelector('#onlineFormControl .form-date').addEventListener('change', function(e) {
    selectedDate = e.target.value;
    updateSelectedDetail();
});

document.querySelector('#onlineFormControl .form-time').addEventListener('change', function(e) {
    selectedTime = e.target.value;
    updateSelectedDetail();
});

document.querySelector('#ewalletFormControl  .form-pembayaran-ewallet').addEventListener('change', function(e) {
    selectedEwallet = e.target.value;
});

document.querySelector('#debitFormControl  .form-pembayaran-debit').addEventListener('change', function(e) {
    selectedDebit = e.target.value;
});

function updateSelectedDetail() {
    document.getElementById('selectedDetail').textContent = 'Tanggal: ' + selectedDate + ', Waktu: ' + selectedTime;
}




// Get all dropdown items
const dropdownItems = document.querySelectorAll('.dropdown-item');

// Get the e-wallet and debit input fields
const ewalletFormControl = document.querySelector('#ewalletFormControl');
const debitFormControl = document.querySelector('#debitFormControl');

// Add click event listener to each dropdown item
dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
        // Prevent the default action
        event.preventDefault();

        // Get the clicked item's text
        const itemText = this.innerText;

        // Show the corresponding input field based on the clicked item
        if (['Gopay', 'Ovo'].includes(itemText)) {
            ewalletFormControl.style.display = 'block';
            debitFormControl.style.display = 'none';
        } else if (['Mandiri', 'BRI', 'BCA'].includes(itemText)) {
            debitFormControl.style.display = 'block';
            ewalletFormControl.style.display = 'none';
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    // Check if the map page is visible
    var mapPage = document.getElementById('mapPage');
    if (mapPage.style.display !== 'none') {
        // Create a new script tag
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDxhhn5N4cLnEzpfxTKIG9ewIVBP6sgdA4&callback=initMap&libraries=geometry';
        script.async = true;

        // Append the script tag to the body
        document.body.appendChild(script);
    }
});


function updateDisplay() {
    document.getElementById('selectedClass').textContent = 'Jenjang: ' + selectedClass;
    document.getElementById('selectedGrade').textContent = 'Kelas: ' + selectedGrade;
    document.getElementById('selectedLesson').textContent = 'Mata Pelajaran: ' + selectedLesson;
    document.getElementById('selectedMaterial').textContent = 'Materi: ' + selectedMaterial;
    document.getElementById('selectedTeacher').textContent = 'Guru: ' + selectedTeacher;
    document.getElementById('selectedPlace').textContent = 'Metode: ' + selectedPlace;
    
    
}


function updateProgressBar(val) {
  progress = val;
  const progressBar = document.querySelector('.progress-bar');
  progressBar.style.width = `${progress}%`;
  progressBar.textContent = `${progress}%`;
}

var nextButton = document.querySelector('.btn.btn-primary:nth-child(2)');
var prevButton = document.querySelector('.btn.btn-primary:nth-child(1)');

function showPreviousPage() {
    if (progress > 0) { // Check if progress is more than 0%
        const currentPage = document.querySelector('.page[style="display: block;"]');
        const prevPage = currentPage.previousElementSibling;
        if (prevPage) {
            currentPage.style.display = 'none';
            prevPage.style.display = 'block';
            progress -= 25;
            updateProgressBar(progress);
        }
    }
}

function showNextPage() {
    if (progress < 100) { // Check if progress is less than 100%
        const currentPage = document.querySelector('.page[style="display: block;"]');
        const nextPage = currentPage.nextElementSibling;
        if (nextPage) {
            currentPage.style.display = 'none';
            nextPage.style.display = 'block';
            progress += 25;
            updateProgressBar(progress);
        }
    }
}

prevButton.addEventListener('click', function(e) {
    showPreviousPage();
});

nextButton.addEventListener('click', function(e) {
    // Validate the form
    if (validateForm()) {
        updateDisplay();
        showNextPage();
    } else {
        alert('Please fill out the form before proceeding.');
    }
});
