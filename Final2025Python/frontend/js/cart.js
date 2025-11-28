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
  showAddToCartAlert(productName);
}
// Remove item from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  showCart();
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
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

  if (!modal || !cartItems || !cartEmpty || !cartTotal) return;

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
          <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
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

    // attach listeners for the dynamically created buttons
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

  modal.style.display = 'flex';
}

// Hide cart modal
function hideCart() {
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Show add to cart alert
function showAddToCartAlert(productName) {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.cart-alert');
  existingAlerts.forEach(alert => alert.remove());

  // Create new alert
  const alert = document.createElement('div');
  alert.className = 'cart-alert';
  alert.textContent = `✅ ${productName} agregado al carrito`;
  alert.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
  `;

  document.body.appendChild(alert);

  // Remove after 2.5 seconds
  setTimeout(() => {
    if (alert.parentNode) alert.parentNode.removeChild(alert);
  }, 2500);
}

// small helper to avoid injection when inserting names
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

  // Close cart modal
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
});
