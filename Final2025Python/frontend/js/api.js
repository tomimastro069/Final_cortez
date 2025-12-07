class Api {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
    }

    async _fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'Error en la petición a la API');
            }
            if (response.status === 204) { // No Content
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error on ${options.method || 'GET'} ${url}:`, error);
            throw error;
        }
    }

    get(endpoint) {
        return this._fetch(endpoint, { method: 'GET' });
    }

    post(endpoint, data) {
        return this._fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        return this._fetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }



    delete(endpoint) {
        return this._fetch(endpoint, { method: 'DELETE' });
    }
}
