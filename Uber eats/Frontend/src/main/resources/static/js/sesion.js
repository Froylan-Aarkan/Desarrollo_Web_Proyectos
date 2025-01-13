function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', (event) => {
    const userIcon = document.querySelector('.user-menu i');
    const userMenu = document.getElementById('userMenu');
    if (!userIcon.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        const userData = decodeJWT(token);
        console.log('Datos del usuario:', userData);

        // Ejemplo de uso de los datos:
        console.log('ID del usuario:', userData.id);
        console.log('Nombre del usuario:', userData.nombre);
        console.log('Rol del usuario:', userData.rol);
    } else {
        alert("Por favor, inicie sesión.");
        window.location.href = '/';
    }
});

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

function getMain(){
    const token = localStorage.getItem('jwt_token');
    if (token) {
        const userData = decodeJWT(token);
        if(userData.rol == "Cliente"){
            window.location.href = '/main';
        }
        if(userData.rol == "Repartidor"){
            window.location.href = '/mainRepartidor';
        }
        if(userData.rol == "Administrador"){
            window.location.href = '/mainAdmin';
        }
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('latitudCliente');
    localStorage.removeItem('longitudCliente');
    alert("Sesión cerrada.");
    window.location.href = '/';
}

function profile() {
    window.location.href = '/profile';
}

function help() {
    window.location.href = '/help';
}