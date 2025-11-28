document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const productsCount = document.getElementById('productsCount');
  const loading = document.getElementById('loading');
  const noProducts = document.getElementById('noProducts');

  if (!productsGrid || !productsCount || !loading || !noProducts) {
    console.error('DOM elements missing for products page');
    return;
  }

  async function fetchAndDisplayProducts() {
    showLoading(true);

    try {
      const resp = await fetch('/api/products');
      if (!resp.ok) throw new Error('Network response not ok: ' + resp.status);
      const products = await resp.json();

      // some backends return id_key instead of id — normalize
      const normalized = Array.isArray(products) ? products.map(p => ({
        id: p.id ?? p.id_key,
        name: p.name,
        price: Number(p.price)
      })) : [];

      displayProducts(normalized);
    } catch (err) {
      console.error('Error fetching products:', err);
      showNoProducts(true);
    } finally {
      showLoading(false);
    }
  }

  function displayProducts(products) {
    productsGrid.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
      productsCount.textContent = '0 productos';
      showNoProducts(true);
      return;
    }

    showNoProducts(false);
    productsCount.textContent = `${products.length} productos`;

    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card card';

      // avoid crashing when price is not number
      const price = Number(product.price) || 0;

      productCard.innerHTML = `
        <img src="images/placeholder.svg" alt="${escapeHtml(product.name)}" />
        <div class="product-title">${escapeHtml(product.name)}</div>
        <div class="product-price price">$${price.toFixed(2)}</div>
        <button class="btn btn-primary btn-add-cart" data-product-id="${product.id ?? product.id_key}">

          Agregar al carrito
        </button>
      `;

      productsGrid.appendChild(productCard);
    });

    setupCartButtons();
  }

  function setupCartButtons() {
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');

    addToCartButtons.forEach(button => {
      // ensure only one listener
      button.replaceWith(button.cloneNode(true));
    });

    // reselect buttons after clone
    const buttons = document.querySelectorAll('.btn-add-cart');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const productId = parseInt(btn.dataset.productId);
        const productCard = btn.closest('.product-card');

        const productName = productCard.querySelector('.product-title').textContent;
        const productPrice = parseFloat(
          productCard.querySelector('.product-price').textContent.replace('$', '')
        );

        const product = {
          id: productId,
          name: productName,
          price: productPrice
        };

        // call addToCart (cart.js accepts object)
        try {
          console.log("CLICK:", product);
          addToCart(product);
        } catch (err) {
          console.error('addToCart failed', err);
        }
      });
    });
  }

  function showLoading(isLoading) {
    loading.style.display = isLoading ? 'block' : 'none';
  }

  function showNoProducts(show) {
    noProducts.style.display = show ? 'block' : 'none';
    if (show) productsGrid.innerHTML = '';
  }

  // small helper to escape
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // initial load
  fetchAndDisplayProducts();
});
