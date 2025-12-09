/**
 * Authentication module for login and register functionality
 */
const API_BASE = "http://localhost:8000";
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupModal();
        this.setupTabs();
        this.setupForms();
        this.loadUserFromStorage();
        this.updateUI();
    }

    setupModal() {
        const loginBtn = document.getElementById('btnLoginNav');
        const loginModal = document.getElementById('loginModal');
        const closeBtn = document.getElementById('closeLogin');

        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                loginModal.style.display = 'block';
            });
        }

        if (closeBtn && loginModal) {
            closeBtn.addEventListener('click', () => {
                loginModal.style.display = 'none';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');

                const tabType = tab.dataset.tab;
                if (tabType === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                } else {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                }
            });
        });
    }

    setupForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        if (email === 'admin@techstore.com' && password === 'admin123') {
            window.location.href = '/admin.html';
            return;
        }

        if (!email || !password) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/v1/clients/login` ,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data;
                this.saveUserToStorage();
                this.updateUI();
                this.closeModal();
                this.showNotification(`¡Bienvenido ${data.name}!`, 'success');
            } else {
                this.showNotification(data.detail || 'Error en el login', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async handleRegister() {
        const form = document.getElementById('registerForm');
        const inputs = form.querySelectorAll('input');
        const name = inputs[0].value.trim();
        const lastname = inputs[1].value.trim();
        const email = inputs[2].value.trim();
        const telephone = inputs[3].value.trim();
        const password = inputs[4].value.trim();

        if (!name || !lastname || !email || !password) {
            this.showNotification('Por favor completa los campos obligatorios', 'error');
            return;
        }

        if (!email.includes('@')) {
            this.showNotification('Por favor ingresa un email válido', 'error');
            return;
        }

        try {
            const payload = {
                name,
                lastname,
                email,
                password
            };
            if (telephone) {
                payload.telephone = telephone;
            }
            const response = await fetch(`${API_BASE}/api/v1/clients/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Cuenta creada exitosamente. Ahora puedes iniciar sesión.', 'success');
                // Switch to login tab
                document.querySelector('[data-tab="login"]').click();
            } else {
                this.showNotification(data.detail || 'Error al crear la cuenta', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    closeModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    loadUserFromStorage() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            try {
                this.currentUser = JSON.parse(user);
            } catch (e) {
                console.error('Error parsing user from storage:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.showNotification('Sesión cerrada', 'info');
    }

    updateUI() {
        const loginBtn = document.getElementById('btnLoginNav');
        const profileLink = document.getElementById('profileLink');
        if (!loginBtn) return;

        if (this.currentUser) {
            loginBtn.innerHTML = `👤 ${this.currentUser.name}`;
            loginBtn.title = 'Cerrar Sesión';
            loginBtn.onclick = () => this.logout();
            if (profileLink) profileLink.style.display = 'inline-block';
        } else {
            loginBtn.innerHTML = '👤 Cuenta';
            loginBtn.title = 'Iniciar Sesión';
            loginBtn.onclick = () => {
                const modal = document.getElementById('loginModal');
                if (modal) modal.style.display = 'block';
            };
            if (profileLink) profileLink.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#007bff',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
