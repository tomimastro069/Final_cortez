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

    const usersTableBody = document.getElementById('usersTableBody');
    const usersLoading = document.getElementById('usersLoading');

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
    async function loadProducts() {
        try {
            productsLoading.style.display = 'block';
            productsTableBody.innerHTML = '';
            const products = await api.get('/products/?skip=0&limit=100');
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

    async function loadCategoriesForSelect() {
        try {
            const categories = await api.get('/categories/?skip=0&limit=100');
            const categoryOptions = categories.map(category => `<option value="${category.id_key}">${category.name}</option>`).join('');
            productCategorySelect.innerHTML = '<option value="">Selecciona una categoría...</option>' + categoryOptions;
            modifyProductCategory.innerHTML = categoryOptions;
        } catch (error) {
            console.error('Error fetching categories for select:', error);
        }
    }

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
            const newProduct = await api.post('/products/', productData);
            showNotification(`Producto "${newProduct.name}" creado exitosamente.`, 'success');
            createProductForm.reset();
            loadProducts();
        } catch (error) {
            showNotification('Error al crear el producto.', 'error');
            console.error('Error creating product:', error);
        }
    });

    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        const productId = row.dataset.id;

        if (target.classList.contains('delete-product')) {
            const productName = row.cells[0].textContent;
            if (confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?`)) {
                try {
                    await api.delete(`/products/id/${productId}`);
                    showNotification('Producto eliminado exitosamente.', 'success');
                    loadProducts();
                } catch (error) {
                    showNotification('Error al eliminar el producto.', 'error');
                    console.error('Error deleting product:', error);
                }
            }
        }

        if (target.classList.contains('modify-product')) {
            const product = await api.get(`/products/id/${productId}`);
            modifyProductId.value = productId;
            modifyProductName.value = product.name;
            modifyProductDescription.value = product.description;
            modifyProductPrice.value = product.price;
            modifyProductStock.value = product.stock;
            if (product.category) {
                modifyProductCategory.value = product.category.id_key;
            }
            modifyProductModal.style.display = 'block';
        }
    });

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
            await api.put(`/products/id/${productId}`, productData);
            showNotification('Producto actualizado exitosamente.', 'success');
            closeModifyModalFunction();
            loadProducts();
        } catch (error) {
            showNotification('Error al actualizar el producto.', 'error');
            console.error('Error updating product:', error);
        }
    });

    const closeModifyModalFunction = () => modifyProductModal.style.display = 'none';
    closeModifyModal.addEventListener('click', closeModifyModalFunction);
    window.addEventListener('click', (e) => {
        if (e.target === modifyProductModal) closeModifyModalFunction();
    });

    // --- Category Management ---
    async function loadCategories() {
        try {
            categoriesLoading.style.display = 'block';
            categoriesTableBody.innerHTML = '';
            const categories = await api.get('/categories/?skip=0&limit=100');
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

    createCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('categoryName').value;
        if (!name) {
            showNotification('Por favor, ingresa un nombre para la categoría.', 'error');
            return;
        }
        try {
            const newCategory = await api.post('/categories', { name });
            showNotification(`Categoría "${newCategory.name}" creada exitosamente.`, 'success');
            createCategoryForm.reset();
            loadCategories();
            loadCategoriesForSelect();
        } catch (error) {
            showNotification('Error al crear la categoría.', 'error');
            console.error('Error creating category:', error);
        }
    });

    categoriesTableBody.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('delete-category')) return;
        const row = e.target.closest('tr');
        const categoryId = row.dataset.id;
        const categoryName = row.cells[0].textContent;
        if (!confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) return;
        try {
            await api.delete(`/categories/id/${categoryId}`);
            showNotification('Categoría eliminada exitosamente.', 'success');
            loadCategories();
            loadCategoriesForSelect();
        } catch (error) {
            showNotification('Error al eliminar la categoría. Asegúrate de que no haya productos asociados a ella.', 'error');
            console.error('Error deleting category:', error);
        }
    });

    // --- User Management ---
    async function loadUsers() {
        try {
            usersLoading.style.display = 'block';
            usersTableBody.innerHTML = '';
            const users = await api.get('/api/v1/clients/');
            users.forEach(user => {
                const fullName = `${user.name} ${user.lastname}`;
                const role = user.is_admin ? 'Admin' : 'User';
                const row = `
                    <tr data-id="${user.id_key}">
                        <td>${user.id_key}</td>
                        <td>${fullName}</td>
                        <td>${user.email}</td>
                        <td>${role}</td>
                        <td>
                            <button class="btn-secondary btn-sm modify-user">Modificar</button>
                            <button class="btn-danger btn-sm delete-user">Eliminar</button>
                        </td>
                    </tr>
                `;
                usersTableBody.innerHTML += row;
            });
        } catch (error) {
            showNotification('Error al cargar los usuarios', 'error');
            console.error('Error fetching users:', error);
        } finally {
            usersLoading.style.display = 'none';
        }
    }

    usersTableBody.addEventListener('click', async e => {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;
        const userId = row.dataset.id;

        if (target.classList.contains('delete-user')) {
            if (!confirm(`¿Eliminar usuario "${row.cells[1].textContent}"?`)) return;
            try {
                await api.delete(`/api/v1/clients/id/${userId}`);
                showNotification('Usuario eliminado exitosamente.', 'success');
                loadUsers();
            } catch (error) {
                showNotification('Error al eliminar el usuario.', 'error');
                console.error(error);
            }
        }

        if (target.classList.contains('modify-user')) {
            showNotification('Funcionalidad de modificar usuario aún no implementada.', 'info');
            console.log('Modify user ID:', userId);
        }
    });

    // --- General ---
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    function setupTabs() {
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                const tabId = link.dataset.tab;
                link.closest('.tabs').querySelectorAll('.tab-link').forEach(t => t.classList.remove('active'));
                link.classList.add('active');
                link.closest('.admin-section').querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
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
        loadUsers();
        document.querySelector('[data-tab="product-create"]').click();
        document.querySelector('[data-tab="category-create"]').click();
    }

    initAdminPanel();
});
