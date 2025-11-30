document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const loadingDiv = productDetailContainer.querySelector('.loading');

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
            ? `<p class="product-category"><strong>Categoría:</strong> ${product.category.name || product.category_id}</p>`
            : product.category_id 
                ? `<p class="product-category"><strong>Categoría ID:</strong> ${product.category_id}</p>`
                : '';

        const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
        const stockText = product.stock > 0 
            ? `${product.stock} unidades disponibles` 
            : 'Agotado';

        productDetailContainer.innerHTML = `
            <div class="product-details">
                <h2 class="product-name">${product.name}</h2>
                ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                <div class="product-info">
                    <p class="product-price"><strong>Precio:</strong> $${product.price.toFixed(2)}</p>
                    <p class="product-stock ${stockClass}">
                        <strong>Stock:</strong> ${stockText}
                    </p>
                    ${categoryDisplay}
                </div>
                <div class="product-actions">
                    <button onclick="history.back()" class="btn-back">← Volver</button>
                    ${product.stock > 0 ? '<button class="btn-add-cart">Agregar al carrito</button>' : '<button class="btn-notify" disabled>Notificar cuando esté disponible</button>'}
                </div>
            </div>
        `;
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