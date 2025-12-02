document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('heroSearch');
  const searchButton = document.getElementById('btnHeroSearch');
  const searchResultsSection = document.getElementById('searchResultsSection');
  const searchResultsGrid = document.getElementById('searchResultsGrid');
  const searchResultsCount = document.getElementById('searchResultsCount');
  const loading = document.getElementById('loading');
  const noResults = document.getElementById('noResults');

  if (!searchInput || !searchButton || !searchResultsSection || !searchResultsGrid || !searchResultsCount || !loading || !noResults) {
    console.error('DOM elements missing for home page search');
    return;
  }

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  async function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      // Hide results if search is cleared
      searchResultsSection.style.display = 'none';
      return;
    }

    showLoading(true);
    searchResultsSection.style.display = 'block';

    try {
      const url = `/api/products/filter?search=${encodeURIComponent(searchTerm)}`;
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Error en la API: ${resp.status}`);
      }
      const products = await resp.json();
      const normalized = products.map(p => ({
        id: p.id ?? p.id_key,
        name: p.name,
        price: Number(p.price),
        stock: p.stock
      }));
      displayProducts(normalized);
    } catch (err) {
      console.error('Error buscando productos:', err);
      showNoResults(true);
    } finally {
      showLoading(false);
    }
  }

  function displayProducts(products) {
    searchResultsGrid.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
      searchResultsCount.textContent = '0 productos';
      showNoResults(true);
      return;
    }

    showNoResults(false);
    searchResultsCount.textContent = `${products.length} productos`;

    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card card';

      const price = Number(product.price) || 0;

      productCard.innerHTML = `
        <img src="images/placeholder.svg" alt="${escapeHtml(product.name)}" />
        <div class="product-title">${escapeHtml(product.name)}</div>
        <div class="product-price price">$${price.toFixed(2)}</div>
        <a href="product-detail.html?id=${product.id ?? product.id_key}" class="btn btn-secondary">Mostrar detalle</a>
        <button class="btn btn-primary btn-add-cart" data-product-id="${product.id ?? product.id_key}">
          Agregar al carrito
        </button>
      `;

      searchResultsGrid.appendChild(productCard);
    });

    setupCartButtons();
  }

  function setupCartButtons() {
    const addToCartButtons = document.querySelectorAll('#searchResultsGrid .btn-add-cart');

    addToCartButtons.forEach(button => {
      // ensure only one listener
      button.replaceWith(button.cloneNode(true));
    });

    const buttons = document.querySelectorAll('#searchResultsGrid .btn-add-cart');
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
          price: productPrice,
          quantity: 1, // Add quantity for cart logic
        };
        
        try {
          addToCart(product); // This function should be available from cart.js
        } catch (err) {
          console.error('addToCart failed', err);
        }
      });
    });
  }


  function showLoading(isLoading) {
    if (loading) loading.style.display = isLoading ? 'block' : 'none';
    if(isLoading) {
        searchResultsGrid.innerHTML = '';
        noResults.style.display = 'none';
    }
  }

  function showNoResults(show) {
    if(noResults) noResults.style.display = show ? 'block' : 'none';
    if (show) {
        searchResultsGrid.innerHTML = '';
        searchResultsCount.textContent = '0 productos';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
});