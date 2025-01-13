let map;
let routingControl;

const token = localStorage.getItem('jwt_token');
let userData = null;

if (token) {
    try {
        userData = decodeJWT(token); 
    } catch (error) {
        console.error("Error al decodificar el token:", error);
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

// Función para cargar los pedidos activos
async function loadActiveOrders() {
    try {
        const response = await fetch('http://localhost:8080/api/carritos/pendientes');
        if (!response.ok) throw new Error("Error al obtener pedidos activos.");
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Función para mostrar los pedidos en la lista
function displayOrders(orders) {
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    orders.forEach(order => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order-item");
        orderDiv.innerHTML = `
            <h3>Estado: ${order.estadoNombre}</h3>
            <p>Latitud: ${order.latitud}</p>
            <p>Longitud: ${order.longitud}</p>
            <p>Total: $${order.precioTotal.toFixed(2)}</p>
            <button onclick="updateCartStatusAceptado(${order.id})">Aceptar entrega</button>
        `;
        orderList.appendChild(orderDiv);
    });
}

function updateCartStatusAceptado(carritoId) {

    repartidorId = userData.id;

    const url = `http://localhost:8080/api/carritos/${carritoId}/aceptado?repartidorId=${repartidorId}`;

    return fetch(url, {
        method: 'PUT'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al actualizar el estado del carrito.");
        }
        return response.json();
        })
    .then(data => {
        console.log('Estado del carrito actualizado:', data);
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        alert("Ocurrió un error al actualizar el carrito.");
    });
}

// Función para iniciar la entrega y mostrar el mapa
async function aceptarEntrega(carritoId, clienteLatitud, clienteLongitud) {
    try {
        const repartidorId = userData.id;
        const response = await fetch(`http://localhost:8080/api/carritos/${carritoId}/aceptado?repartidorId=${repartidorId}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text(); 
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Entrega aceptada:", data);

        localizacionClienteRestaurante(clienteLatitud, clienteLongitud, restauranteLatitud, restauranteLongitud);
    } catch (error) {
        console.error("Error al aceptar la entrega:", error);
    }
}

function localizacionClienteRestaurante(clienteLatitud, clienteLongitud, restauranteLatitud, restauranteLongitud) {
    const mapOverlay = document.getElementById("mapOverlay");
    mapOverlay.style.display = "block";
    restauranteLatitud = 19.5430951556591;
    restauranteLongitud = -96.92773002048708;

    if (!map) {
        map = L.map('map').setView([clienteLatitud, clienteLongitud], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([clienteLatitud, clienteLongitud]).addTo(map);
    }

    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(restauranteLatitud, restauranteLongitud),
            L.latLng(clienteLatitud, clienteLongitud)
        ],
        routeWhileDragging: true
    }).addTo(map);

    setTimeout(() => {
        map.invalidateSize();
    }, 200);
}

function closeMap() {
    const mapOverlay = document.getElementById("mapOverlay");
    mapOverlay.style.display = "none";
}

// Cargar los pedidos activos al iniciar la página
document.addEventListener("DOMContentLoaded", loadActiveOrders);