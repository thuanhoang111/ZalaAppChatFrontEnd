
const api = 'http://localhost:8080';
const client = 'http://localhost:8000';

$(document).ready(function () {
    let form = document.getElementById('formRegister');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        let fullName = form.elements['fullName'].value;
        
        let phoneNumber = form.elements['phoneNumber'].value;
        let password = form.elements['password'].value;

        let formRegis = {
            phoneNumber: phoneNumber,
            password: password,
            fullName: fullName,
        };
        $.ajax({
            type: 'POST',
            url: `${api}/auth/register`,
            data: JSON.stringify(formRegis),
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
                xhr.setRequestHeader("Accept", "application/json");
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            success: function () {
                window.location.href = `${client}/login`;
            },
            async: true,
        });
    });
});
