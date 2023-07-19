import Swal from "sweetalert2";

const getAlert = (title, text, icon, button) => {
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: button,
    });
}

export { getAlert }