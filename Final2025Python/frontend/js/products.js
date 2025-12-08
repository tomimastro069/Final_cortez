document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('productsGrid');
  const productsCount = document.getElementById('productsCount');
  const loading = document.getElementById('loading');
  const noProducts = document.getElementById('noProducts');
  const API_BASE = "http://localhost:8000";
  if (!productsGrid || !productsCount || !loading || !noProducts) {
    console.error('DOM elements missing for products page');
    return;
  }

  async function fetchAndDisplayProducts() {
  showLoading(true);

  try {
    const query = buildQueryParams();
    const url = query 
      ? `${API_BASE}/products/filter?${query}` 
      : `${API_BASE}/products/`;

    console.log("Fetching:", url);

    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Error en la API: " + resp.status);

    const products = await resp.json();

    const normalized = products.map(p => ({
      id: p.id ?? p.id_key,
      name: p.name,
      price: Number(p.price),
      stock: p.stock
    }));

    displayProducts(normalized);

  } catch (err) {
    console.error("Error filtrando productos:", err);
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
        <a href="product-detail.html?id=${product.id ?? product.id_key}" class="btn btn-secondary">Mostrar detalle</a>
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
          showNotification(`${product.name} agregado al carrito!`, 'success');
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
function buildQueryParams() {
  const search = document.getElementById("searchInput").value.trim();
  const category = document.querySelector(".category-btn.active")?.dataset.category;
  const minPrice = document.getElementById("minPrice").value;
  const maxPrice = document.getElementById("maxPrice").value;
  const inStock = document.getElementById("inStockOnly").checked;
  const sort = document.getElementById("sortSelect").value;

  const params = new URLSearchParams();

  if (search) params.append("search", search);

  if (category && category !== "all") {
    params.append("category_id", parseInt(category));
  }

  if (minPrice !== "" && !isNaN(minPrice)) {
    params.append("min_price", parseFloat(minPrice));
  }

  if (maxPrice !== "" && !isNaN(maxPrice)) {
    params.append("max_price", parseFloat(maxPrice));
  }

  if (inStock) params.append("in_stock_only", "true");

  if (sort !== "default") {
    params.append("sort_by", sort); 
  }

  return params.toString();
}

async function fetchCategories() {
  try {
    const resp = await fetch(`${API_BASE}/categories/`); // <--- Asegurate de tener la barra final
    if (!resp.ok) throw new Error("Error fetching categories");

    const categories = await resp.json();
    const categoriesList = document.getElementById('categoriesList');

    // Clear existing buttons except the "all" button
    const allButton = categoriesList.querySelector('[data-category="all"]');
    categoriesList.innerHTML = '';
    categoriesList.appendChild(allButton);

    categories.forEach(category => {
      const button = document.createElement('button');
      button.className = 'category-btn btn-ghost';
      button.setAttribute('data-category', category.id ?? category.id_key);
      button.textContent = category.name;
      categoriesList.appendChild(button);
    });

  } catch (err) {
    console.error("Error loading categories:", err);
  }
}
function setupFilters() {
  document.getElementById("btnSearch").addEventListener("click", fetchAndDisplayProducts);

  document.getElementById("searchInput").addEventListener("keyup", (e) => {
    if (e.key === "Enter") fetchAndDisplayProducts();
  });

  document.getElementById("btnApplyPrice").addEventListener("click", fetchAndDisplayProducts);

  document.getElementById("inStockOnly").addEventListener("change", fetchAndDisplayProducts);

  document.getElementById("sortSelect").addEventListener("change", fetchAndDisplayProducts);

  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      fetchAndDisplayProducts();
    });
  });

  document.getElementById("btnClearFilters").addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("inStockOnly").checked = false;
    document.getElementById("sortSelect").value = "default";

    document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-category="all"]').classList.add("active");

    fetchAndDisplayProducts();
  });
}

  // Load categories first, then setup filters and load products
  await fetchCategories();
  setupFilters();
  // initial load
  fetchAndDisplayProducts();
});
