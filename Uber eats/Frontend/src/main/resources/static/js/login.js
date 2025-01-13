function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Cambiamos el tipo de contenido a JSON
        },
        body: JSON.stringify({ // Convertimos los datos a JSON
            correo: email,
            contrasenia: password
        })
    })
        .then(response => {
            if (response.ok) {
                return response.json(); // Esperamos un objeto JSON con el token y la expiración
            } else {
                throw new Error('Email o contraseña, respuesta incorrecta.');
            }
        })
        .then(data => {
            const token = data.token;

            // Almacenar el token en LocalStorage
            localStorage.setItem('jwt_token', token);

            // Decodificar y mostrar información del usuario
            const userData = decodeJWT(token);
            
            // Redirigir al usuario a la página principal
            alert("Bienvenido(a) " + userData.rol);
            if(userData.rol == "Cliente"){
                window.location.href = '/main';
            }
            if(userData.rol == "Repartidor"){
                window.location.href = '/mainRepartidor';
            }
            if(userData.rol == "Administrador"){
                window.location.href = '/mainAdmin';
            }
        })
        .catch(error => {
            alert(error.message);
        });
}

function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}

const modal = document.getElementById('registrationModal');

function toggleModal() {
    if (modal.style.display === 'block') {
        modal.style.display = 'none';

        const form = document.getElementById('registrationForm');
        form.reset();
    } else {
        modal.style.display = 'block';
    }
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Función para registrar al usuario
async function register() {
    const nombre = document.getElementById('name').value;
    const apellidoPaterno = document.getElementById('apellidoPaterno').value;
    const apellidoMaterno = document.getElementById('apellidoMaterno').value;
    const correo = document.getElementById('new-email').value;
    const contrasenia = document.getElementById('new-password').value;

    const rol = document.querySelector('input[name="value-radio"]:checked').value;

    const data = { nombre, apellidoPaterno, apellidoMaterno, correo, contrasenia };

    if(!nombre || !apellidoPaterno || !apellidoMaterno || !correo || !contrasenia){
        alert('Por favor, complete todos los campos.');
        return;
    }

    let url = '';
    if (rol === 'cliente') {
        url = 'http://localhost:8080/api/usuarios/cliente'; // URL específica para cliente
    } else if (rol === 'repartidor') {
        url = 'http://localhost:8080/api/usuarios/repartidor'; // URL específica para repartidor
    } else {
        alert('Rol no válido.');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Verificar la respuesta del servidor
        if (response.ok) {
            const result = await response.json();

            // Restablecer el formulario y cerrar el modal
            document.getElementById('registrationForm').reset();
            toggleModal();
        } else {
            const error = await response.json();
            alert(`Error al registrar: ${error.message}`);
        }
    } catch (err) {
        console.error('Error en la solicitud:', err);
        alert('Hubo un problema al procesar el registro.');
    }
    toggleModal();
}