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
    const response = await fetch(`${API_BASE}/api/v1/clients/${client_id}`);

    if (response.ok) {
      const profile = await response.json();
      document.getElementById('profileName').textContent = profile.name;
      document.getElementById('profileLastname').textContent = profile.lastname;
      document.getElementById('profileEmail').textContent = profile.email;
      document.getElementById('profileTelephone').textContent = profile.telephone || 'No especificado';
    } else {
      alert('Error al cargar perfil');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('client_id');
      window.location.href = 'index.html';
    }
  } catch (err) {
    console.error('Profile load error:', err);
    alert('Error al cargar perfil');
  }
}

async function loadOrders(client_id) {
  try {
    const response = await fetch(`/api/v1/orders/clients/${client_id}/orders`);

    if (response.ok) {
      const orders = await response.json();
      displayOrders(orders);
    } else {
      document.getElementById('ordersContainer').innerHTML = '<p>No se pudieron cargar los pedidos.</p>';
    }
  } catch (err) {
    console.error('Orders load error:', err);
    document.getElementById('ordersContainer').innerHTML = '<p>Error al cargar los pedidos.</p>';
  }
}

function displayOrders(orders) {
  const container = document.getElementById('ordersContainer');

  if (!orders || orders.length === 0) {
    container.innerHTML = '<p>No tienes pedidos aún.</p>';
    return;
  }

  const ordersHtml = orders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <span><strong>Pedido #${order.id}</strong></span>
        <span class="order-status status-${order.status?.toLowerCase() || 'pending'}">${order.status || 'Pendiente'}</span>
      </div>
      <p>Total: $${order.total?.toFixed(2) || '0.00'}</p>
      <p>Fecha: ${new Date(order.created_at).toLocaleDateString()}</p>
    </div>
  `).join('');

  container.innerHTML = `<ul class="orders-list">${ordersHtml}</ul>`;
}
