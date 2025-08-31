'use strict';

class AuthManager {
    constructor(config = {}) {
        this.user = null;
        this.listeners = [];
        this.tokenExpiryTime = null;
        if (AuthManager.instance) {
            return AuthManager.instance;
        }
        this.config = {
            domain: config.domain || window.location.hostname,
            secure: config.secure ?? window.location.protocol === 'https:',
            sameSite: config.sameSite || 'lax',
            crossOriginEnabled: config.crossOriginEnabled ?? true,
            tokenExpiry: config.tokenExpiry || 24 * 60 * 60 * 1000, // 24 hours default
            ...config
        };
        this.restoreSession();
        this.setupCrossOriginListener();
        AuthManager.instance = this;
    }
    login(user, token) {
        this.user = user;
        this.tokenExpiryTime = Date.now() + (this.config.tokenExpiry || 0);
        // Store in localStorage
        localStorage.setItem('auth:token', token);
        localStorage.setItem('auth:user', JSON.stringify(user));
        localStorage.setItem('auth:expiry', this.tokenExpiryTime.toString());
        // Store in cookies for cross-application sharing
        this.setCookie('auth_token', token, this.config.tokenExpiry || 0);
        this.setCookie('auth_user', JSON.stringify(user), this.config.tokenExpiry || 0);
        this.notify();
        this.broadcast('login', user);
        // Store in sessionStorage for current tab
        sessionStorage.setItem('auth:token', token);
        sessionStorage.setItem('auth:user', JSON.stringify(user));
    }
    logout() {
        this.user = null;
        this.tokenExpiryTime = null;
        // Clear all storage
        localStorage.removeItem('auth:token');
        localStorage.removeItem('auth:user');
        localStorage.removeItem('auth:expiry');
        sessionStorage.removeItem('auth:token');
        sessionStorage.removeItem('auth:user');
        // Clear cookies
        this.deleteCookie('auth_token');
        this.deleteCookie('auth_user');
        this.notify();
        this.broadcast('logout');
    }
    isLoggedIn() {
        if (!this.user)
            return false;
        // Check if token has expired
        if (this.tokenExpiryTime && Date.now() > this.tokenExpiryTime) {
            this.logout();
            return false;
        }
        return true;
    }
    getUser() {
        return this.user;
    }
    getToken() {
        return localStorage.getItem('auth:token') || sessionStorage.getItem('auth:token');
    }
    // Method to share auth with another application via URL
    generateAuthUrl(targetUrl) {
        if (!this.isLoggedIn()) {
            throw new Error('User must be logged in to generate auth URL');
        }
        const token = this.getToken();
        const user = this.getUser();
        if (!token || !user) {
            throw new Error('Invalid auth state');
        }
        const url = new URL(targetUrl);
        url.searchParams.set('auth_token', token);
        url.searchParams.set('auth_user', JSON.stringify(user));
        url.searchParams.set('auth_timestamp', Date.now().toString());
        return url.toString();
    }
    // Method to process auth from URL (for receiving applications)
    processAuthFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('auth_token');
        const userStr = urlParams.get('auth_user');
        const timestamp = urlParams.get('auth_timestamp');
        if (token && userStr && timestamp) {
            try {
                const user = JSON.parse(userStr);
                const authTime = parseInt(timestamp);
                // Check if auth is not too old (5 minutes)
                if (Date.now() - authTime < 5 * 60 * 1000) {
                    this.login(user, token);
                    // Clean up URL parameters
                    const url = new URL(window.location.href);
                    url.searchParams.delete('auth_token');
                    url.searchParams.delete('auth_user');
                    url.searchParams.delete('auth_timestamp');
                    window.history.replaceState({}, '', url.toString());
                    return true;
                }
            }
            catch (e) {
                console.error('Failed to process auth from URL:', e);
            }
        }
        return false;
    }
    // Method to share auth with another application via postMessage
    shareAuthWithApp(targetOrigin, targetWindow) {
        if (!this.isLoggedIn()) {
            throw new Error('User must be logged in to share auth');
        }
        const token = this.getToken();
        const user = this.getUser();
        if (!token || !user) {
            throw new Error('Invalid auth state');
        }
        targetWindow.postMessage({
            type: 'AUTH_SHARE',
            auth: { token, user, timestamp: Date.now() }
        }, targetOrigin);
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
        // Try to restore from cookies first (for cross-application sharing)
        const cookieToken = this.getCookie('auth_token');
        const cookieUser = this.getCookie('auth_user');
        // Fallback to localStorage
        const localToken = localStorage.getItem('auth:token');
        const localUser = localStorage.getItem('auth:user');
        // Use whichever is available
        const token = cookieToken || localToken;
        const userStr = cookieUser || localUser;
        if (token && userStr) {
            try {
                this.user = JSON.parse(userStr);
                const expiryStr = localStorage.getItem('auth:expiry');
                if (expiryStr) {
                    this.tokenExpiryTime = parseInt(expiryStr);
                }
            }
            catch (e) {
                console.error('Failed to restore user session:', e);
                this.logout();
            }
        }
    }
    setupCrossOriginListener() {
        if (!this.config.crossOriginEnabled)
            return;
        // Listen for auth sharing from other applications
        window.addEventListener('message', (event) => {
            if (event.data.type === 'AUTH_SHARE') {
                const { token, user, timestamp } = event.data.auth;
                // Check if auth is not too old (5 minutes)
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    this.login(user, token);
                }
            }
        });
    }
    setCookie(name, value, maxAge) {
        const cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; domain=${this.config.domain}; ${this.config.secure ? 'secure;' : ''} samesite=${this.config.sameSite}`;
        document.cookie = cookie;
    }
    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        }
        return null;
    }
    deleteCookie(name) {
        this.setCookie(name, '', -1);
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

exports.authManager = authManager;
//# sourceMappingURL=index.js.map
