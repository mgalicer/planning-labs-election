let modal = document.getElementById('user-modal');

let button = document.getElementById("form-button");

// When the user clicks on the button, open the modal
button.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}