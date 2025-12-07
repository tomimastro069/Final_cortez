document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const loadingDiv = productDetailContainer.querySelector('.loading');
    const API_BASE = "http://localhost:8000";

    // ----------------------------
    // Cart Functions
    // ----------------------------
    const getCart = () => JSON.parse(localStorage.getItem('shoppingCart')) || [];

    const saveCart = (cart) => {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount();
        updateCartDisplay();
    };

    const addToCart = (product) => {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === (product.id ?? product.id_key));
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ 
                id: product.id ?? product.id_key,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        saveCart(cart);
        showNotification(`${product.name} agregado al carrito`, 'success');
    };

    const removeFromCart = (productId) => {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
    };

    const changeQuantity = (productId, delta) => {
        const cart = getCart();
        const item = cart.find(p => p.id === productId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) removeFromCart(productId);
        else saveCart(cart);
    };

    const updateCartCount = () => {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    };

    const updateCartDisplay = () => {
        const cartContainer = document.getElementById('cartContainer');
        if (!cartContainer) return;

        const cart = getCart();
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>El carrito está vacío</p>';
            return;
        }

        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                <div class="cart-item-quantity">
                    <button class="btn-decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn-increase" data-id="${item.id}">+</button>
                </div>
                <button class="btn-remove" data-id="${item.id}">Eliminar</button>
            </div>
        `).join('');

        // Event listeners
        cartContainer.querySelectorAll('.btn-increase').forEach(btn => {
            btn.addEventListener('click', () => {
                changeQuantity(parseInt(btn.dataset.id), 1);
            });
        });

        cartContainer.querySelectorAll('.btn-decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                changeQuantity(parseInt(btn.dataset.id), -1);
            });
        });

        cartContainer.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                removeFromCart(parseInt(btn.dataset.id));
            });
        });
    };

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#007bff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // ----------------------------
    // Product Detail & Recommendations
    // ----------------------------
    const escapeHtml = (str) => {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    };

    const getProductId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const fetchProductDetails = async (productId) => {
        const apiUrl = `${API_BASE}/products/id/${productId}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const product = await response.json();
            return product;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const renderProductDetails = (product) => {
        loadingDiv.style.display = 'none';
        if (!product) {
            productDetailContainer.innerHTML = `
                <div class="error-container">
                    <p class="error">No se pudo cargar el producto.</p>
                    <button onclick="window.location.href='products.html'" class="btn-back">Volver a productos</button>
                </div>
            `;
            return;
        }

        const categoryDisplay = product.category
            ? `<p class="product-category">${product.category.name || product.category_id}</p>`
            : product.category_id
                ? `<p class="product-category">Categoría ID: ${product.category_id}</p>`
                : '';

        const stockText = product.stock > 0
            ? `${product.stock} unidades disponibles`
            : 'Agotado';

        let imageSrc = product.image_url;
        if (imageSrc && imageSrc.startsWith('/frontend/')) imageSrc = imageSrc.replace('/frontend/', '/');

        productDetailContainer.innerHTML = `
            <img src="${imageSrc || '/images/placeholder.svg'}" alt="${product.name}" class="product-image" onerror="this.src='/images/placeholder.svg'">
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-stock">${stockText}</p>
                ${categoryDisplay}
                <div class="product-actions">
                    <button onclick="history.back()" class="btn-back">Volver</button>
                    ${product.stock > 0 ? `<button class="btn-add-to-cart" data-product-id="${product.id ?? product.id_key}">Agregar al carrito</button>` : '<button class="btn-notify" disabled>Notificar cuando esté disponible</button>'}
                </div>
            </div>
        `;

        const addToCartBtn = productDetailContainer.querySelector('.btn-add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }

        loadProductRecommendations(product);
    };

    const loadProductRecommendations = async (currentProduct) => {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;

        try {
            const categoryId = currentProduct.category_id || (currentProduct.category && currentProduct.category.id);
            if (!categoryId) {
                recommendationsGrid.innerHTML = '<div class="no-recommendations">No hay recomendaciones disponibles</div>';
                return;
            }

            const apiUrl = `${API_BASE}/products/filter?category_id=${categoryId}&limit=6`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Error fetching recommendations');
            const products = await response.json();

            const normalizedProducts = products.map(p => ({
                id: p.id ?? p.id_key,
                name: p.name,
                price: p.price,
                image_url: p.image_url,
                stock: p.stock,
                category_id: p.category_id,
                category: p.category
            }));

            const recommendations = normalizedProducts
                .filter(product => product.id !== (currentProduct.id ?? currentProduct.id_key))
                .slice(0, 4);

            displayRecommendations(recommendations);
        } catch (error) {
            console.error(error);
            recommendationsGrid.innerHTML = '<div class="no-recommendations">Error al cargar recomendaciones</div>';
        }
    };

    const displayRecommendations = (recommendations) => {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;

        if (!recommendations || recommendations.length === 0) {
            recommendationsGrid.innerHTML = '<div class="no-recommendations">No hay productos similares disponibles</div>';
            return;
        }

        recommendationsGrid.innerHTML = recommendations.map(product => {
            const price = Number(product.price) || 0;
            let imageSrc = product.image_url;
            if (imageSrc && imageSrc.startsWith('/frontend/')) imageSrc = imageSrc.replace('/frontend/', '/');

            return `
                <div class="recommendation-card">
                    <img src="${imageSrc || '/images/placeholder.svg'}" alt="${escapeHtml(product.name)}" class="recommendation-image" onerror="this.src='/images/placeholder.svg'">
                    <div class="recommendation-info">
                        <div class="recommendation-name">${escapeHtml(product.name)}</div>
                        <div class="recommendation-price">$${price.toFixed(2)}</div>
                        <div class="recommendation-actions">
                            <a href="product-detail.html?id=${product.id}" class="btn btn-view-detail">Ver Detalle</a>
                            <button class="btn btn-add-recommendation" data-product-id="${product.id}" data-product-name="${escapeHtml(product.name)}" data-product-price="${price}">
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        recommendationsGrid.querySelectorAll('.btn-add-recommendation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = {
                    id: parseInt(btn.dataset.productId),
                    name: btn.dataset.productName,
                    price: parseFloat(btn.dataset.productPrice)
                };
                addToCart(product);
            });
        });
    };

    // ----------------------------
    // Init
    // ----------------------------
    const init = async () => {
        updateCartCount();
        updateCartDisplay();

        const productId = getProductId();
        if (!productId) {
            loadingDiv.style.display = 'none';
            productDetailContainer.innerHTML = `
                <div class="error-container">
                    <p class="error">ID de producto no encontrado en la URL.</p>
                    <button onclick="window.location.href='products.html'" class="btn-back">Ir a productos</button>
                </div>
            `;
            return;
        }

        const product = await fetchProductDetails(productId);
        renderProductDetails(product);
    };

    init();
});
