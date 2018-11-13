const modal = document.getElementById('user-modal');

const button = document.getElementById('form-button');

// When the user clicks on the button, open the modal
button.onclick = () => {
    modal.style.display = 'block';
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

const myForm = document.getElementById('new-candidate-data');

myForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const object = {};

    new FormData(myForm).forEach((value, key) => {
        object[key] = value;
    });

    const json = JSON.stringify(object);
    document.getElementsByClassName('debug')[0].innerHTML = json;
});
