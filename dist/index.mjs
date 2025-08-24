class AuthManager {
    constructor() {
        this.user = null;
        this.listeners = [];
        if (AuthManager.instance) {
            return AuthManager.instance;
        }
        this.restoreSession();
        AuthManager.instance = this;
    }
    login(user, token) {
        this.user = user;
        localStorage.setItem('auth:token', token);
        localStorage.setItem('auth:user', JSON.stringify(user));
        this.notify();
        this.broadcast('login', user);
    }
    logout() {
        this.user = null;
        localStorage.removeItem('auth:token');
        localStorage.removeItem('auth:user');
        this.notify();
        this.broadcast('logout');
    }
    isLoggedIn() {
        return !!this.user;
    }
    getUser() {
        return this.user;
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    notify() {
        this.listeners.forEach(listener => listener(this.user));
    }
    broadcast(type, user) {
        // Cross-tab sync
        window.postMessage({ type: `AUTH_${type.toUpperCase()}`, user }, '*');
        try {
            const channel = new BroadcastChannel('auth:channel');
            channel.postMessage({ type, user });
            channel.close();
        }
        catch (e) {
            console.warn('BroadcastChannel not supported');
        }
    }
    restoreSession() {
        const token = localStorage.getItem('auth:token');
        const userStr = localStorage.getItem('auth:user');
        if (token && userStr) {
            this.user = JSON.parse(userStr);
        }
    }
    static listenForExternalChanges() {
        // Listen to BroadcastChannel
        try {
            const channel = new BroadcastChannel('auth:channel');
            channel.onmessage = (event) => {
                const manager = new AuthManager();
                if (event.data.type === 'login') {
                    manager.user = event.data.user;
                    manager.notify();
                }
                else if (event.data.type === 'logout') {
                    manager.user = null;
                    manager.notify();
                }
            };
        }
        catch (e) {
            console.warn('BroadcastChannel not available');
        }
        // Listen to postMessage (fallback)
        window.addEventListener('message', (event) => {
            const manager = new AuthManager();
            if (event.data.type === 'AUTH_LOGIN') {
                manager.user = event.data.user;
                manager.notify();
            }
            else if (event.data.type === 'AUTH_LOGOUT') {
                manager.user = null;
                manager.notify();
            }
        });
        // Listen to localStorage changes (cross-tab)
        window.addEventListener('storage', (event) => {
            if (event.key === 'auth:user' && !event.newValue && event.oldValue) {
                const manager = new AuthManager();
                manager.user = null;
                manager.notify();
            }
        });
    }
}
const authManager = new AuthManager();

export { authManager };
//# sourceMappingURL=index.mjs.map
