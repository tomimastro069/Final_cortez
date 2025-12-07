document.addEventListener('DOMContentLoaded', () => {
    const api = new Api();

    // DOM Elements
    const createProductForm = document.getElementById('createProductForm');
    const productsTableBody = document.getElementById('productsTableBody');
    const productsLoading = document.getElementById('productsLoading');
    const productCategorySelect = document.getElementById('productCategory');

    const createCategoryForm = document.getElementById('createCategoryForm');
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    const categoriesLoading = document.getElementById('categoriesLoading');

    const modifyProductModal = document.getElementById('modifyProductModal');
    const closeModifyModal = document.getElementById('closeModifyModal');
    const modifyProductForm = document.getElementById('modifyProductForm');
    const modifyProductId = document.getElementById('modifyProductId');
    const modifyProductName = document.getElementById('modifyProductName');
    const modifyProductDescription = document.getElementById('modifyProductDescription');
    const modifyProductPrice = document.getElementById('modifyProductPrice');
    const modifyProductStock = document.getElementById('modifyProductStock');
    const modifyProductCategory = document.getElementById('modifyProductCategory');


    // --- Product Management ---

    // Fetch and display all products
    async function loadProducts() {
        try {
            productsLoading.style.display = 'block';
            productsTableBody.innerHTML = '';
            const products = await api.get('/api/products/');
            products.forEach(product => {
                const row = `
                    <tr data-id="${product.id_key}">
                        <td>${product.name}</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="btn-secondary btn-sm modify-product">Modificar</button>
                            <button class="btn-danger btn-sm delete-product">Eliminar</button>
                        </td>
                    </tr>
                `;
                productsTableBody.innerHTML += row;
            });
        } catch (error) {
            showNotification('Error al cargar los productos', 'error');
            console.error('Error fetching products:', error);
        } finally {
            productsLoading.style.display = 'none';
        }
    }

    // Populate categories dropdown
    async function loadCategoriesForSelect() {
        try {
            const categories = await api.get('/api/categories/');
            const categoryOptions = categories.map(category => `<option value="${category.id_key}">${category.name}</option>`).join('');
            productCategorySelect.innerHTML = '<option value="">Selecciona una categoría...</option>' + categoryOptions;
            modifyProductCategory.innerHTML = categoryOptions;
        } catch (error) {
            console.error('Error fetching categories for select:', error);
        }
    }

    // Handle create product form submission
    createProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const category_id = document.getElementById('productCategory').value;

        if (!name || !description || isNaN(price) || isNaN(stock) || !category_id) {
            showNotification('Por favor, completa todos los campos correctamente.', 'error');
            return;
        }

        const productData = { name, description, price, stock, category_id };

        try {
            const newProduct = await api.post('/api/products/', productData);
            showNotification(`Producto "${newProduct.name}" creado exitosamente.`, 'success');
            createProductForm.reset();
            loadProducts(); // Refresh product list
        } catch (error) {
            showNotification('Error al crear el producto.', 'error');
            console.error('Error creating product:', error);
        }
    });

    // Handle product table clicks for modify or delete
    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;

        const productId = row.dataset.id;

        if (target.classList.contains('delete-product')) {
            const productName = row.cells[0].textContent;
            if (confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?`)) {
                try {
                    await api.delete(`/api/products/id/${productId}`);
                    showNotification('Producto eliminado exitosamente.', 'success');
                    loadProducts(); // Refresh product list
                } catch (error) {
                    showNotification('Error al eliminar el producto.', 'error');
                    console.error('Error deleting product:', error);
                }
            }
        }

        if (target.classList.contains('modify-product')) {
            // Obtener los datos directamente de la fila de la tabla
            const product = await api.get(`/api/products/id/${productId}`); // Usamos la API para obtener todos los datos, incluida la descripción

            // Rellenar el formulario en el modal
            modifyProductId.value = productId;
            modifyProductName.value = product.name;
            modifyProductDescription.value = product.description;
            modifyProductPrice.value = product.price;
            modifyProductStock.value = product.stock;
            if (product.category) {
                modifyProductCategory.value = product.category.id_key;
            }

            // Mostrar el modal
            modifyProductModal.style.display = 'block';
        }
    });

    // La función openModifyModal ya no es necesaria, la hemos integrado arriba.

    // Handle modify product form submission
    modifyProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = modifyProductId.value;
        const productData = {
            name: modifyProductName.value,
            description: modifyProductDescription.value,
            price: parseFloat(modifyProductPrice.value),
            stock: parseInt(modifyProductStock.value),
            category_id: modifyProductCategory.value
        };

        try {
            await api.put(`/api/products/id/${productId}`, productData);
            showNotification('Producto actualizado exitosamente.', 'success');
            closeModifyModalFunction();
            loadProducts();
        } catch (error) {
            showNotification('Error al actualizar el producto.', 'error');
            console.error('Error updating product:', error);
        }
    });

    // Close modal logic
    const closeModifyModalFunction = () => modifyProductModal.style.display = 'none';
    closeModifyModal.addEventListener('click', closeModifyModalFunction);
    window.addEventListener('click', (e) => {
        if (e.target === modifyProductModal) {
            closeModifyModalFunction();
        }
    });


    // --- Category Management ---

    // Fetch and display all categories
    async function loadCategories() {
        try {
            categoriesLoading.style.display = 'block';
            categoriesTableBody.innerHTML = '';
            const categories = await api.get('/api/categories/');
            categories.forEach(category => {
                const row = `
                    <tr data-id="${category.id_key}">
                        <td>${category.name}</td>
                        <td>
                            <button class="btn-danger btn-sm delete-category">Eliminar</button>
                        </td>
                    </tr>
                `;
                categoriesTableBody.innerHTML += row;
            });
        } catch (error) {
            showNotification('Error al cargar las categorías', 'error');
            console.error('Error fetching categories:', error);
        } finally {
            categoriesLoading.style.display = 'none';
        }
    }

    // Handle create category form submission
    createCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('categoryName').value;

        if (!name) {
            showNotification('Por favor, ingresa un nombre para la categoría.', 'error');
            return;
        }

        try {
            const newCategory = await api.post('/api/categories', { name });
            showNotification(`Categoría "${newCategory.name}" creada exitosamente.`, 'success');
            createCategoryForm.reset();
            loadCategories(); // Refresh category list
            loadCategoriesForSelect(); // Refresh product form dropdown
        } catch (error) {
            showNotification('Error al crear la categoría.', 'error');
            console.error('Error creating category:', error);
        }
    });

    // Handle category deletion
    categoriesTableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-category')) {
            const row = e.target.closest('tr');
            const categoryId = row.dataset.id;
            const categoryName = row.cells[0].textContent;

            if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
                try {
                    await api.delete(`/api/categories/id/${categoryId}`);
                    showNotification('Categoría eliminada exitosamente.', 'success');
                    loadCategories(); // Refresh category list
                    loadCategoriesForSelect(); // Refresh product form dropdown
                } catch (error) {
                    showNotification('Error al eliminar la categoría. Asegúrate de que no haya productos asociados a ella.', 'error');
                    console.error('Error deleting category:', error);
                }
            }
        }
    });


    // --- General ---

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function setupTabs() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');

        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;

                // Deactivate all tabs in the same section
                link.closest('.tabs').querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                link.classList.add('active');

                // Deactivate all content in the same section
                link.closest('.admin-section').querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                // Activate the target content
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Initial load
    function initAdminPanel() {
        setupTabs();
        loadProducts();
        loadCategories();
        loadCategoriesForSelect();

        // Set initial tab states
        document.querySelector('[data-tab="product-create"]').click();
        document.querySelector('[data-tab="category-create"]').click();
    }

    initAdminPanel();
});