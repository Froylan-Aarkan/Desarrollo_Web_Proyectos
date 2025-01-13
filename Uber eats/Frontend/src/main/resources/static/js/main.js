const defaultCoordinates = [19.542036520704066, -96.92693352699281];
let map;
let marker;
let foodItems = [];

const savedLat = localStorage.getItem("latitudCliente");
const savedLng = localStorage.getItem("longitudCliente");

console.log(savedLat);
console.log(savedLng);

function showMap() {
    const mapOverlay = document.getElementById("mapOverlay");
    const coordinatesDiv = document.getElementById("coordinates");

    coordinatesDiv.style.display = "block";
    mapOverlay.style.display = "block";

    const initialCoordinates = savedLat && savedLng
        ? { lat: parseFloat(savedLat), lng: parseFloat(savedLng) }
        : { lat: defaultCoordinates[0], lng: defaultCoordinates[1] };

    saveCoordinates(initialCoordinates);

    if (!map) {
        map = L.map('map').setView([initialCoordinates.lat, initialCoordinates.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        marker = L.marker([initialCoordinates.lat, initialCoordinates.lng]).addTo(map);

        // Mostrar las coordenadas iniciales en el contenedor
        document.getElementById("latLngText").innerHTML = `Lat: ${initialCoordinates.lat}<br>Lng: ${initialCoordinates.lng}`;        

        map.on('locationfound', function (e) {
            marker.setLatLng(e.latlng);
            document.getElementById("latLngText").innerHTML = `Lat: ${e.latlng.lat}<br> Lng: ${e.latlng.lng}`;
            saveCoordinates(e.latlng);
        });

        map.on('click', function (e) {
            marker.setLatLng(e.latlng);
            document.getElementById("latLngText").innerHTML = `Lat: ${e.latlng.lat}<br> Lng: ${e.latlng.lng}`;
            saveCoordinates(e.latlng);
        });

        map.on('locationerror', function (e) {
            map.setView(defaultCoordinates, 16);
            document.getElementById("latLngText").innerHTML = `Lat: ${defaultCoordinates[0]}<br>Lng: ${defaultCoordinates[1]}`;
            saveCoordinates({ lat: defaultCoordinates[0], lng: defaultCoordinates[1] });
            alert("No se pudo obtener la ubicación actual. Usando ubicación por defecto.");
        });
    }

    setTimeout(() => {
        map.invalidateSize();
    }, 200);
}

function saveCoordinates(coordinates) {
    localStorage.setItem("latitudCliente", coordinates.lat);
    localStorage.setItem("longitudCliente", coordinates.lng);
    console.log(`Coordenadas guardadas:\nLatitud: ${localStorage.getItem("latitudCliente")}\nLongitud: ${localStorage.getItem("longitudCliente")}`);
}

function closeMap() {
    const mapOverlay = document.getElementById("mapOverlay");
    mapOverlay.style.display = "none";
}

const API_URL = "http://localhost:8080/api/comidas";

function fetchProducts() {
    $.ajax({
        url: API_URL,
        method: "GET",
        dataType: "json",
        success: function (products) {
            foodItems = products;
            displayItems(products);
        },
        error: function () {
            console.error("Error al obtener comidas.");
        },
    });
}

// Función para mostrar los productos en el contenedor
function displayItems(items) {
    const container = $("#foodContainer");
    container.empty(); // Limpia el contenedor

    const token = localStorage.getItem('jwt_token');
    let userData = null;

    if (token) {
        try {
            userData = decodeJWT(token); // Intentar decodificar el token
        } catch (error) {
            console.error("Error al decodificar el token:", error);
        }
    }

    items.forEach(item => {

        const imageData = atob(item.imagen);
        const byteArray = new Uint8Array(imageData.length);
        for (let i = 0; i < imageData.length; i++) {
            byteArray[i] = imageData.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: 'image/png' }); // Ajuste del tipo de imagen

        const imageUrl = URL.createObjectURL(blob);

        const foodDiv = `
            <div class="food-item" data-id="${item.id}">
                <img src="${imageUrl}" alt="${item.nombre}">
                <h3>${item.nombre}</h3>
                <p>${item.establecimientoNombre}</p>
                <div class="price">$${item.precio}</div>
                <button class="add-to-cart-button" onclick="addToCart(${item.id}, ${userData.id}, '${item.nombre}', ${item.precio})">+</button>
            </div>
        `;
        container.append(foodDiv);
    });
}

function addToCart(id, idUsuario, name, price) {
    if (!id || !idUsuario) {
        console.error("ID de usuario o producto no válido.");
        return;
    }

    const cantidad = 1;
    const params = new URLSearchParams();
    params.append('usuarioId', idUsuario);
    params.append('comidaId', id);
    params.append('cantidad', cantidad);

    // Guardar en el servidor
    fetch('http://localhost:8080/api/carritos/agregar-pedido', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    })
    .then(response => {
        if (!response.ok) throw new Error("Error al sincronizar con el servidor.");
        return response.json();
    })
    .then(data => {
        console.log("Producto sincronizado con el servidor:", data);
    })
    .catch(error => {
        console.error("Error en la sincronización del carrito:", error);
    });
}   

// Cargar los productos al inicio
document.addEventListener("DOMContentLoaded", fetchProducts);

function goToCart() {
    const latCliente = localStorage.getItem("latitudCliente");
    const lngCliente = localStorage.getItem("longitudCliente");

    if (!latCliente || !lngCliente) alert("Se requiere seleccionar la ubicación antes de tener acceder al carrito");
    else window.location.href = "/carrito"; 
}

window.onload = () => {
    fetchProducts();
};

function filterItems() {
    const searchQuery = document.getElementById("searchBar").value.toLowerCase();
    const filteredItems = foodItems.filter(item => 
        item.nombre.toLowerCase().includes(searchQuery) || 
        item.establecimientoNombre.toLowerCase().includes(searchQuery)
    );
    displayItems(filteredItems);
}