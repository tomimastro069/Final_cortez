// Shopping cart functionality
let cart = [];

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('shoppingCart');
  cart = savedCart ? JSON.parse(savedCart) : [];
  updateCartBadge();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
  updateCartBadge();
}

// Add product to cart
// Accepts either (product) where product = {id, name, price}
// or (productId, productName, productPrice)
function addToCart(a, b, c) {
  let productId, productName, productPrice;

  if (typeof a === 'object' && a !== null) {
    // product object passed from products.js
    productId = a.id ?? a.id_key;
    productName = a.name;
    productPrice = a.price;
  } else {
    // individual args passed
    productId = a;
    productName = b;
    productPrice = c;
  }

  productId = parseInt(productId);
  productPrice = parseFloat(productPrice);

  if (Number.isNaN(productId) || Number.isNaN(productPrice)) {
    console.warn('addToCart: invalid id or price', productId, productPrice);
    return;
  }

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      quantity: 1
    });
  }

  saveCart();
  showAddToCartAlert(`${productName} agregado al carrito`, 'success');
}

// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();

  const modal = document.getElementById('cartModal');
  if (modal && modal.style.display === 'flex') {
    const cartItems = document.getElementById('cartItems');
    const itemDiv = cartItems.querySelector(`.cart-item-controls button[data-id='${productId}']`)?.parentElement.parentElement;
    if (itemDiv) itemDiv.remove();

    // Si quedó vacío, mostrar mensaje
    if (cart.length === 0) {
      document.getElementById('cartEmpty').style.display = 'block';
      document.getElementById('cartTotal').textContent = '0.00';
    } else {
      document.getElementById('cartTotal').textContent = getCartTotalPrice().toFixed(2);
    }
  }
}
// Update item quantity
function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  item.quantity = newQuantity;
  saveCart();

  // Actualizar cantidad en DOM si modal está abierto
  const modal = document.getElementById('cartModal');
  if (modal && modal.style.display === 'flex') {
    const cartItems = document.getElementById('cartItems');
    const itemDiv = cartItems.querySelector(`.cart-item-controls button[data-id='${productId}']`)?.parentElement;
    if (itemDiv) {
      itemDiv.querySelector('span').textContent = item.quantity;
      itemDiv.parentElement.querySelector('.cart-item-total').textContent = `$${(item.price * item.quantity).toFixed(2)}`;
      document.getElementById('cartTotal').textContent = getCartTotalPrice().toFixed(2);
    }
  }
}


// Clear entire cart
function clearCart() {
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    cart = [];
    saveCart();
    showCart();
  }
}

// Get total items in cart
function getCartTotalItems() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get total price
function getCartTotalPrice() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = getCartTotalItems();
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'inline' : 'none';
  }
}

// Show cart modal
function showCart() {
  const modal = document.getElementById('cartModal');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartTotal = document.getElementById('cartTotal');

  if (!modal || !cartItems || !cartEmpty || !cartTotal) {
    console.error('Cart modal elements not found');
    return;
  }

  // Preserve scroll position
  const scrollTop = cartItems.scrollTop;

  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartEmpty.style.display = 'block';
    cartTotal.textContent = '0.00';
  } else {
    cartEmpty.style.display = 'none';
    cartTotal.textContent = getCartTotalPrice().toFixed(2);

    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <p>$${item.price.toFixed(2)} c/u</p>
        </div>
        <div class="cart-item-controls">
          <button data-id="${item.id}" class="qty-decrease">-</button>
          <span>${item.quantity}</span>
          <button data-id="${item.id}" class="qty-increase">+</button>
          <button data-id="${item.id}" class="remove-btn">🗑️</button>
        </div>
        <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');

    // Attach event listeners for dynamically created buttons
    cartItems.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const it = cart.find(x => x.id === id);
        if (it) updateQuantity(id, it.quantity - 1);
      });
    });

    cartItems.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const it = cart.find(x => x.id === id);
        if (it) updateQuantity(id, it.quantity + 1);
      });
    });

    cartItems.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        removeFromCart(id);
      });
    });
  }

  // Show modal with flex display
  modal.style.display = 'flex';
  
  // Prevent body scroll when modal is open
  document.body.style.overflow = 'hidden';

  // Restore scroll position after rendering
  setTimeout(() => {
    cartItems.scrollTop = scrollTop;
  }, 0);
}

// Hide cart modal
function hideCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.style.display = 'none';
    // Restore body scroll
    document.body.style.overflow = '';
  }
}

// Show add to cart alert
function showAddToCartAlert(message, type = 'success') {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.cart-alert');
  existingAlerts.forEach(alert => alert.remove());

  // Create new alert
  const alert = document.createElement('div');
  alert.className = 'cart-alert';
  alert.textContent = message;

  const colors = {
    success: '#4CAF50', // Verde
    error: '#f44336',   // Rojo
    info: '#2196F3'     // Azul
  };
  const icon = type === 'success' ? '✅' : '❌';
  alert.textContent = `${icon} ${message}`;

  alert.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10001;
    font-size: 14px;
  `;

  document.body.appendChild(alert);

  // Remove after 2.5 seconds
  setTimeout(() => {
    if (alert.parentNode) alert.parentNode.removeChild(alert);
  }, 2500);
}

// Helper to avoid XSS injection when inserting names
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadCart();

  // Cart icon click
  const cartBtn = document.getElementById('btnCartNav');
  if (cartBtn) {
    cartBtn.addEventListener('click', showCart);
  }

  // Close cart modal button
  const closeBtn = document.getElementById('closeCart');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideCart);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        hideCart();
      }
    });
  }

  // Clear cart button
  const clearBtn = document.getElementById('btnClearCart');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearCart);
  }

  // Checkout button
  const checkoutBtn = document.getElementById('btnCheckout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async function() {
      if (cart.length === 0) {
        showAddToCartAlert('El carrito está vacío', 'error');
        return;
      }

      // Verificar si el usuario está logueado
      if (!window.authManager || !window.authManager.isLoggedIn()) {
        hideCart(); // Ocultamos el modal del carrito
        showAddToCartAlert('Debes iniciar sesión para comprar', 'error');
        // Mostramos el modal de login
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'block';
        return;
      }

      const currentUser = window.authManager.getCurrentUser();

      try {
        const api = new Api(); 

        // --- INICIO: Verificación de stock ---
        const products = await api.get('/products/?skip=0&limit=1000'); // Obtenemos los productos
        const productsMap = new Map(products.map(p => [p.id_key, p]));

        const stockErrors = [];
        for (const item of cart) {
          const productInDb = productsMap.get(item.id);
          if (!productInDb) {
            stockErrors.push(`El producto "${item.name}" ya no está disponible.`);
          } else if (item.quantity > productInDb.stock) {
            stockErrors.push(`No hay stock suficiente para "${item.name}". Disponible: ${productInDb.stock}, en tu carrito: ${item.quantity}.`);
          }
        }

        if (stockErrors.length > 0) {
          // Mostramos todos los errores de stock encontrados
          showAddToCartAlert(stockErrors.join(' '), 'error');
          hideCart(); // Opcional: ocultar el carrito para que vea la alerta
          return; // Detenemos la compra
        }
        // --- FIN: Verificación de stock ---

        // 1. Crear la factura
        const billData = {
          client_id: currentUser.id_key,
          total: getCartTotalPrice(),
          bill_number: `B-${Date.now()}`, // Generamos un número de factura simple y único
          date: new Date().toISOString().split('T')[0],   // Usamos la fecha actual en formato YYYY-MM-DD
          payment_type: 1                   // Asumimos 1 como un tipo de pago válido (ej: Tarjeta)
        };
        const createdBill = await api.post('/bills/', billData);

        // 2. Crear la orden
        const orderData = {
          client_id: currentUser.id_key,
          total: getCartTotalPrice(),
          status: 1, // 1: Pendiente
          delivery_method: 1, // 1: Pickup
          date: new Date().toISOString(),
          bill_id: createdBill.id_key
          // Se elimina order_details de aquí, se crearán por separado.
        };
        const createdOrder = await api.post('/orders/', orderData);
        
        // 3. Crear cada OrderDetail por separado
        const orderId = createdOrder.id ?? createdOrder.id_key;
        for (const item of cart) {
          const detailData = {
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          };
          await api.post('/order_details/', detailData);
        }
        
        showAddToCartAlert(`¡Compra #${orderId} realizada con éxito!`, 'success');
        
        // Limpiar carrito y actualizar UI
        cart = [];
        saveCart();
        showCart(); // Refresca el modal del carrito para mostrarlo vacío

      } catch (error) {
        console.error('Error al crear la orden:', error);
        showAddToCartAlert('Error al procesar la compra. Inténtalo de nuevo.', 'error');
      }
    });
  }
});