document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('heroSearch');
  const searchResultsPopup = document.getElementById('searchResultsPopup');
  const API_BASE = "http://localhost:8000";

  if (!searchInput || !searchResultsPopup) return;

  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);

    const value = searchInput.value.trim();
    if (!value) {
      searchResultsPopup.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(() => performSearch(value), 300);
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResultsPopup.contains(e.target)) {
      searchResultsPopup.style.display = 'none';
    }
  });

  async function performSearch(searchTerm) {
    searchResultsPopup.innerHTML = '<div class="loading">Buscando...</div>';
    searchResultsPopup.style.display = 'block';

    try {
      const resp = await fetch(`${API_BASE}/products/filter?search=${encodeURIComponent(searchTerm)}`);
      if (!resp.ok) throw new Error('Error API');

      const products = await resp.json();
      const productArray = Array.isArray(products) ? products : products.data ?? [];

      if (productArray.length === 0) {
        searchResultsPopup.innerHTML = '<div class="no-results">😔 No se encontraron productos.</div>';
        return;
      }

      searchResultsPopup.innerHTML = '';
      productArray.forEach(p => {
        const item = document.createElement('a');
        item.href = `product-detail.html?id=${p.id ?? p.id_key}`;
        item.className = 'search-result-item';
        item.textContent = p.name;
        searchResultsPopup.appendChild(item);
      });
    } catch (err) {
      searchResultsPopup.innerHTML = '<div class="no-results">😔 Error buscando productos.</div>';
      console.error(err);
    }
  }
});
