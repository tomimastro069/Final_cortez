document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const loadingDiv = productDetailContainer.querySelector('.loading');

    // Cart functionality
    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();

        // Show success message
        showNotification(`${product.name} agregado al carrito!`, 'success');
    };

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    };

    const showNotification = (message, type = 'info') => {
        // Create notification element
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Initialize cart count on page load
    updateCartCount();



    // Product Recommendations
    const loadProductRecommendations = async (currentProduct) => {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;

        console.log('Loading recommendations for product:', currentProduct);

        try {
            const categoryId = currentProduct.category_id || (currentProduct.category && currentProduct.category.id);
            console.log('Category ID:', categoryId);

            if (!categoryId) {
                recommendationsGrid.innerHTML = '<div class="no-recommendations">No hay recomendaciones disponibles</div>';
                return;
            }

            // Fetch products from the same category (get more to account for filtering out current product)
            const apiUrl = `/api/products/filter?category_id=${categoryId}&limit=6`;
            console.log('Fetching recommendations from:', apiUrl);

            const response = await fetch(apiUrl);
            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const products = await response.json();
            console.log('Products received:', products);

            // Normalize product data to ensure id field exists
            const normalizedProducts = products.map(p => ({
                id: p.id ?? p.id_key,
                name: p.name,
                price: p.price,
                image_url: p.image_url,
                stock: p.stock,
                category_id: p.category_id,
                category: p.category
            }));

            console.log('Current product ID:', currentProduct.id ?? currentProduct.id_key, 'Type:', typeof (currentProduct.id ?? currentProduct.id_key));

            // Filter out the current product and limit to 4 recommendations
            let recommendations = normalizedProducts
                .filter(product => {
                    console.log('Comparing product.id:', product.id, 'Type:', typeof product.id, 'with currentProduct.id:', currentProduct.id ?? currentProduct.id_key);
                    return product.id !== (currentProduct.id ?? currentProduct.id_key);
                })
                .slice(0, 4);

            console.log('Filtered recommendations:', recommendations);

            // If no recommendations from API, show no recommendations
            if (!recommendations || recommendations.length === 0) {
                console.log('No recommendations from API');
                recommendations = [];
            }

            displayRecommendations(recommendations);

        } catch (error) {
            console.error('Error loading recommendations:', error);
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

        const recommendationsHtml = recommendations.map(product => {
            const price = Number(product.price) || 0;
            // Normalize image URL to fix path issues
            let imageSrc = product.image_url;
            if (imageSrc && imageSrc.startsWith('/frontend/')) {
                imageSrc = imageSrc.replace('/frontend/', '/');
            }
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

        recommendationsGrid.innerHTML = recommendationsHtml;

        // Add event listeners for recommendation buttons
        setupRecommendationButtons();
    };

    const setupRecommendationButtons = () => {
        const addButtons = document.querySelectorAll('.btn-add-recommendation');
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const product = {
                    id: parseInt(btn.dataset.productId),
                    name: btn.dataset.productName,
                    price: parseFloat(btn.dataset.productPrice)
                };
                addToCart(product);
            });
        });
    };

    // Helper function to escape HTML
    const escapeHtml = (str) => {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '<')
            .replaceAll('>', '>')
            .replaceAll('"', '"')
            .replaceAll("'", '&#39;');
    };

    const getProductId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const fetchProductDetails = async (productId) => {
        // Usar el proxy /api/ con la ruta correcta /products/id/{id}
        const apiUrl = `/api/products/id/${productId}`;
        
        console.log(`Fetching product from: ${apiUrl}`);
        
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', errorText);
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const product = await response.json();
            console.log('Product received:', product);
            return product;
            
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null;
        }
    };

    const renderProductDetails = (product) => {
        loadingDiv.style.display = 'none';

        if (!product) {
            productDetailContainer.innerHTML = `
                <div class="error-container">
                    <p class="error">No se pudo cargar el producto. Por favor, intente de nuevo más tarde.</p>
                    <button onclick="window.location.href='products.html'" class="btn-back">Volver a productos</button>
                </div>
            `;
            return;
        }

        // Manejar el caso donde category puede ser un objeto o null
        const categoryDisplay = product.category
            ? `<p class="product-category">${product.category.name || product.category_id}</p>`
            : product.category_id
                ? `<p class="product-category">Categoría ID: ${product.category_id}</p>`
                : '';

        const stockText = product.stock > 0
            ? `${product.stock} unidades disponibles`
            : 'Agotado';

        // Normalize image URL to fix path issues
        let imageSrc = product.image_url;
        if (imageSrc && imageSrc.startsWith('/frontend/')) {
            imageSrc = imageSrc.replace('/frontend/', '/');
        }
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
                    ${product.stock > 0 ? '<button class="btn-add-to-cart" data-product-id="' + product.id + '">Agregar al carrito</button>' : '<button class="btn-notify" disabled>Notificar cuando esté disponible</button>'}
                </div>
            </div>
        `;

        // Add event listener for add to cart button
        const addToCartBtn = productDetailContainer.querySelector('.btn-add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(product);
            });
        }

        // Load product recommendations
        loadProductRecommendations(product);
    };

    const init = async () => {
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