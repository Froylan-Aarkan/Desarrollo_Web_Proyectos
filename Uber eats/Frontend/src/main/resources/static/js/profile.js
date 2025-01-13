const carritoId = localStorage.getItem('carritoIdCliente');

const urlPendiente = `http://localhost:8080/api/carritos/${carritoId}/pendientes`;
const urlAceptada = `http://localhost:8080/api/carritos/${carritoId}/aceptados`;
const urlTransito = `http://localhost:8080/api/carritos/${carritoId}/transito`;

window.onload = function() {
    getUserDataFromLocalStorage();
};

function getUserDataFromLocalStorage() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        const userData = decodeJWT(token); 
        
        document.getElementById('user-name').textContent = userData.nombre;
        document.getElementById('user-email').textContent = userData.sub;
    } else {
        console.warn("TWT Token no encontrado. Usuario podría no estar registrado.");
    }
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

document.addEventListener("DOMContentLoaded", () => {
    if (carritoId) {
        // Llamar a las funciones para obtener los historiales con el id del carrito
        fetchPendiente();
    } else {
        console.error("No se encontró el id del carrito en el localStorage.");
    }
});

function fetchPendiente() {
    fetch(urlPendiente)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(pedidos => {
            if (!pedidos || pedidos.length === 0) {
                renderPendiente([]);  
                return;
            }
            renderPendiente(pedidos);
        })
        .catch(error => {
            console.error("Error al obtener pedidos pendientes:", error);
            renderPendiente([]); 
        });
}

function renderPendiente(pedidos) {
    const container = document.getElementById(`pendiente-history`);
    container.innerHTML = '';  // Limpiar el contenido anterior

    if (pedidos.length === 0) {
        container.innerHTML = `<p>No hay ningún pedido pendiente actualmente.</p>`;
    } else {
        pedidos.forEach(item => {
            const pedidoDiv = `
                <div class="pedido-item" data-id="${item.id}">
                    <p>${item.latitud}</p>
                    <p>${item.longitud}</p>
                    <div class="price">$${item.precioTotal}</div>
                </div>
            `;
            container.innerHTML += pedidoDiv;  // Añadir cada pedido al contenedor
        });
    }
}

function renderHistory(status, data) {
    const container = document.getElementById(`${status}-history`);
    
    // Limpiar el contenido antes de llenarlo
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `<p>No tienes pedidos ${status}.</p>`;
    } else {
        data.forEach(carrito => {
            const pedidoElement = document.createElement("div");
            pedidoElement.classList.add("pedido");
            pedidoElement.innerHTML = `
                <h3>Pedido #${carrito.id}</h3>
                <p>Estado: ${carrito.estado}</p>
                <p>Total: $${carrito.total}</p>
                <p>Fecha: ${new Date(carrito.fecha).toLocaleString()}</p>
            `;
            container.appendChild(pedidoElement);
        });
    }
}