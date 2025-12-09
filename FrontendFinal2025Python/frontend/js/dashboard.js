const API_BASE = "http://localhost:8000";
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  const client_id = currentUser.id ?? currentUser.id_key;

  loadProfile(client_id);
  loadOrders(client_id);

  // Logout functionality
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('client_id');
      window.location.href = 'index.html';
    });
  }

  // Dashboard navigation
  const btnDashboardNav = document.getElementById('btnDashboardNav');
  if (btnDashboardNav) {
    btnDashboardNav.addEventListener('click', () => {
      // Already on dashboard
    });
  }
});

async function loadProfile(client_id) {
  try {
    // Hacemos una llamada a la API para obtener los datos completos y actualizados del perfil.
    // WORKAROUND: El endpoint /api/v1/clients/id/{id} está roto.
    // Obtenemos todos los clientes y filtramos por el ID del usuario actual.
    const api = new Api();
    const allClients = await api.get(`/api/v1/clients/`);
    const profile = allClients.find(client => (client.id ?? client.id_key) === client_id);
    if (!profile) throw new Error("Perfil no encontrado en la lista de clientes.");

    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = profile.name || '';

    const profileLastnameEl = document.getElementById('profileLastname');
    if (profileLastnameEl) profileLastnameEl.textContent = profile.lastname || '';

    const profileEmailEl = document.getElementById('profileEmail');
    if (profileEmailEl) profileEmailEl.textContent = profile.email || '';

    const profileTelephoneEl = document.getElementById('profileTelephone');
    if (profileTelephoneEl) profileTelephoneEl.textContent = profile.telephone || 'No especificado';
    
    // Guardamos el perfil completo en localStorage para futuras referencias
    if (profile) {
      localStorage.setItem('currentUser', JSON.stringify(profile));
    }

  } catch (err) {
    console.error('Error al mostrar el perfil:', err);
    const profileContainer = document.getElementById('profileContainer');
    if (profileContainer) {
      profileContainer.innerHTML = '<p class="error">Hubo un problema al mostrar la información de tu perfil.</p>';
    }
  }
}

async function loadOrders(client_id) {
  const container = document.getElementById('ordersContainer');
  if (!container) {
    console.warn("El contenedor de órdenes 'ordersContainer' no fue encontrado en el DOM.");
    return;
  }

  try {
    const api = new Api();
    const allOrders = await api.get(`/orders/`);

    // Aseguramos que client_id sea un número para la comparación
    const currentClientId = parseInt(client_id);

    const orders = allOrders.filter(order => {
      const orderClientId = order.client_id ?? order.client?.id_key;
      return parseInt(orderClientId) === currentClientId;
    });

    displayOrders(orders);

  } catch (err) {
    console.error('Orders load error:', err);
    container.innerHTML = '<p>Error al cargar los pedidos.</p>';
  }
}

function displayOrders(orders) {
  const container = document.getElementById('ordersContainer');
  if (!container) return; // Salir si el contenedor no existe

  if (!orders || orders.length === 0) {
    container.innerHTML = '<p>No tienes pedidos aún.</p>';
    return;
  }

  const statusMap = {
    1: { text: 'Pendiente', className: 'pending' },
    2: { text: 'En Proceso', className: 'processing' },
    3: { text: 'Completado', className: 'completed' },
    4: { text: 'Cancelado', className: 'cancelled' }
  };
  const defaultStatus = { text: 'Desconocido', className: 'unknown' };

  const ordersHtml = orders.map(order => {
    // Usamos order.id_key si order.id no está presente
    const orderId = order.id ?? order.id_key;
    const statusInfo = statusMap[order.status] || defaultStatus;
    return `
    <div class="order-item" data-order-id="${orderId}">
      <div class="order-header">
        <span><strong>Pedido #${orderId}</strong></span>
        <span class="order-status status-${statusInfo.className}">${statusInfo.text}</span>
        <button class="toggle-details-btn">Ver detalles</button>
      </div>
      <p>Total: $${(order.total ?? 0).toFixed(2)}</p>
      <p>Fecha: ${new Date(order.date).toLocaleDateString()}</p>
      <div class="order-details-content" style="display: none;">
        <div class="details-loading">Cargando detalles...</div>
        <p>Método de envío: ${order.delivery_method === 1 ? 'Recogida' : 'Envío'}</p>
        <p>Número de factura: ${order.bill_id}</p>
      </div>
    </div>
  `}).join('');

  container.innerHTML = `<ul class="orders-list">${ordersHtml}</ul>`;
}

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('toggle-details-btn')) {
    const orderItem = e.target.closest('.order-item');
    if (!orderItem) return;

    const detailsContent = orderItem.querySelector('.order-details-content');
    const isHidden = detailsContent.style.display === 'none';

    // Simplemente oculta si ya está visible
    if (!isHidden) {
      detailsContent.style.display = 'none';
      e.target.textContent = 'Ver detalles';
      return;
    }

    // Muestra y carga los detalles si estaba oculto
    detailsContent.style.display = 'block';
    e.target.textContent = 'Ocultar detalles';

    const orderId = orderItem.dataset.orderId;
    const detailsLoading = detailsContent.querySelector('.details-loading');

    // Solo carga los detalles una vez
    if (detailsLoading.dataset.loaded) return;

    try {
      const api = new Api();
      // WORKAROUND: El endpoint /orders/ no devuelve los detalles de los productos.
      // Obtenemos todos los "order_details" y los filtramos por el order_id.
      const allOrderDetails = await api.get(`/order_details/`);

      // Usamos '==' para comparar de forma flexible (string vs número)
      const relevantDetails = allOrderDetails.filter(detail => detail.order_id == orderId);

      if (!relevantDetails || relevantDetails.length === 0) {
        detailsLoading.innerHTML = '<li>No se encontraron productos para este pedido.</li>';
        detailsLoading.dataset.loaded = "true";
        return;
      }
      
      let productsHtml = '<li>No hay detalles de productos.</li>';
      if (relevantDetails.length > 0) {
        productsHtml = relevantDetails.map(detail => `
          <li>${detail.quantity} x ${detail.product?.name || `Producto ID: ${detail.product_id}`} - $${(detail.price ?? 0).toFixed(2)}</li>
        `).join('');
      }
      detailsLoading.innerHTML = `<h4>Productos:</h4><ul class="product-list">${productsHtml}</ul>`;
      detailsLoading.dataset.loaded = "true"; // Marcar como cargado
    } catch (error) {
      console.error('Error al cargar detalles del pedido:', error);
      detailsLoading.innerHTML = '<p class="error">No se pudieron cargar los detalles.</p>';
    }
  } 
});
