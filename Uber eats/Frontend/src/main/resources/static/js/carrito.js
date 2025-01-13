const carritoIdEnStorage = localStorage.getItem('carritoIdCliente');
if (carritoIdEnStorage) {
    window.location.href = '/profile';
}

const token = localStorage.getItem('jwt_token');
let userData = null;
let carritoId = null;

if (token) {
    try {
        userData = decodeJWT(token); // Intentar decodificar el token
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

function fetchCartData(usuarioId) {
    const url = `http://localhost:8080/api/carritos/activo/${usuarioId}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener los datos del carrito.");
            }
            return response.json();
        })
        .then(data => {
            return data; // Retornar los datos del carrito
            document.getElementById('overlay').style.display = 'none';
        })
        .catch(error => {
            console.error("Error en la solicitud:", error);
            alert("Ocurrió un error al cargar el carrito.");
            document.getElementById('overlay').style.display = 'none';
            return null; // En caso de error, retornar null
        });
}

function showOverlay() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = '<p>Esperando un repartidor...</p>';
}

function updateCartStatusPendiente(carritoId) {
    localStorage.setItem('carritoIdCliente', carritoId);
    console.log(localStorage.getItem('carritoIdCliente'));

    const savedLat = localStorage.getItem("latitudCliente");
    const savedLng = localStorage.getItem("longitudCliente");

    if (!savedLat || !savedLng) {
        console.error("No se encontraron las coordenadas en el localStorage.");
        alert("No se encontraron las coordenadas para actualizar el carrito.");
        window.location.href = '/main';
    }

    const url = `http://localhost:8080/api/carritos/${carritoId}/pendiente`;

    const requestData = {
        latitud: savedLat,
        longitud: savedLng
    };

    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify(requestData),
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

// Mostrar los datos del carrito en la página
function renderCart() {
    const usuarioId = userData.id; 
    const cartItemsContainer = document.getElementById("cart-items");
    const totalAmountElement = document.getElementById("total-amount");

    // Limpiar el contenedor antes de llenarlo
    cartItemsContainer.innerHTML = "";

    fetchCartData(usuarioId).then(cartData => {
        if (!cartData) {
            cartItemsContainer.innerHTML = "<p>Ocurrió un error al cargar el carrito.</p>";
            totalAmountElement.textContent = "0.00";
            return;
        }

        carritoId = cartData.id;
        const pedidos = cartData.pedidos || [];
        let totalAmount = 0;

        // Verificar si el carrito está vacío
        if (pedidos.length === 0) {
            cartItemsContainer.innerHTML = "<p>Tu carrito activo está vacío.</p>";
            totalAmountElement.textContent = "0.00";
            return;
        }

        const uniqueProducts = {};

        pedidos.forEach(pedido => {
            if (uniqueProducts[pedido.comidaId]) {
                uniqueProducts[pedido.comidaId].cantidad += pedido.cantidad;
            } else {
                uniqueProducts[pedido.comidaId] = pedido;
            }
        });

        // Generar elementos para cada producto en el carrito
        for (let comidaId in uniqueProducts) {
            const pedido = uniqueProducts[comidaId];

            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";
            itemElement.style.display = "flex";
            itemElement.style.justifyContent = "space-between";
            itemElement.style.alignItems = "center";
            itemElement.style.marginBottom = "10px";

            const imageData = atob(pedido.comidaImagen);
            const byteArray = new Uint8Array(imageData.length);
            for (let i = 0; i < imageData.length; i++) {
                byteArray[i] = imageData.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(blob);

            itemElement.innerHTML = `
                <img src="${imageUrl}" class="pre-cart-food" alt="${pedido.comidaNombre}" />
                <span><strong>${pedido.comidaNombre}</strong></span>
                <span>$${pedido.comidaPrecio.toFixed(2)} x ${pedido.cantidad}</span>
                <button class="remove-btn" data-pedido-id="${pedido.pedidoId}" data-carrito-id="${carritoId}"> &minus;</button>
            `;

            cartItemsContainer.appendChild(itemElement);
            totalAmount += pedido.comidaPrecio * pedido.cantidad;
        }

        // Agregar eventos a los botones de eliminación
        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const pedidoId = this.getAttribute("data-pedido-id");
                const carritoId = this.getAttribute("data-carrito-id");
                removeFromCart(pedidoId, carritoId);
            });
        });

        // Actualizar el precio total
        totalAmountElement.textContent = totalAmount.toFixed(2);
    });
}

// Eliminar un producto del carrito
function removeFromCart(pedidoId, carritoId) {
    if (!carritoId) {
        console.error("El carritoId no está disponible.");
        return;
    }

    if (!pedidoId) {
        console.error("El pedidoId no está disponible.");
        return;
    }

    if(pedidoId && carritoId){
        console.log(pedidoId);
        console.log(carritoId);
    }

    // Realizar la solicitud DELETE al servidor
    fetch(`http://localhost:8080/api/carritos/${carritoId}/eliminar-pedido/${pedidoId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) throw new Error('Error al eliminar el pedido del carrito');
        return response.json();
    })
    .then(data => {
        console.log('Carrito actualizado:', data);
        renderCart();  // Actualizar la vista
    })
    .catch(error => {
        renderCart();
    });
}

// Procesar el pago (simulación)
function checkout() {
    alert("Gracias por tu compra. Espere un momento en lo que su pedido es aceptado, más detalles en la ventana de 'Mi perfil' ");

    updateCartStatusPendiente(carritoId);
    window.location.href = '/profile';
}

// Llamar a la función para renderizar el carrito al cargar la página
window.onload = renderCart;