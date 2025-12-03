document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('heroSearch');
  const searchResultsPopup = document.getElementById('searchResultsPopup');
  
  if (!searchInput || !searchResultsPopup) {
    console.error('DOM elements missing for home page search');
    return;
  }

  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(searchInput.value);
    }, 300);
  });

  // Hide popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResultsPopup.contains(e.target)) {
      searchResultsPopup.style.display = 'none';
    }
  });

  async function performSearch(searchTerm) {
    searchTerm = searchTerm.trim();
    if (!searchTerm) {
      searchResultsPopup.style.display = 'none';
      return;
    }

    showLoading(true);
    searchResultsPopup.style.display = 'block';

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
    searchResultsPopup.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
      showNoResults(true);
      return;
    }

    showNoResults(false);

    products.forEach(product => {
      const item = document.createElement('a');
      item.href = `product-detail.html?id=${product.id}`;
      item.className = 'search-result-item';
      item.textContent = escapeHtml(product.name);
      searchResultsPopup.appendChild(item);
    });
  }

  function showLoading(isLoading) {
    if (isLoading) {
      searchResultsPopup.innerHTML = '<div class="loading">Buscando...</div>';
      searchResultsPopup.style.display = 'block';
    }
  }

  function showNoResults(show) {
    if (show) {
      searchResultsPopup.innerHTML = '<div class="no-results">😔 No se encontraron productos.</div>';
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
