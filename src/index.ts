// src/index.ts
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

class AuthManager {
  private user: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    if ((AuthManager as any).instance) {
      return (AuthManager as any).instance;
    }

    this.restoreSession();
    (AuthManager as any).instance = this;
  }

  login(user: User, token: string) {
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

  isLoggedIn(): boolean {
    return !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.user));
  }

  private broadcast(type: 'login', user: User): void;
  private broadcast(type: 'logout'): void;
  private broadcast(type: string, user?: User) {
    // Cross-tab sync
    window.postMessage({ type: `AUTH_${type.toUpperCase()}`, user }, '*');
    try {
      const channel = new BroadcastChannel('auth:channel');
      channel.postMessage({ type, user });
      channel.close();
    } catch (e) {
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
        } else if (event.data.type === 'logout') {
          manager.user = null;
          manager.notify();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not available');
    }

    // Listen to postMessage (fallback)
    window.addEventListener('message', (event) => {
      const manager = new AuthManager();
      if (event.data.type === 'AUTH_LOGIN') {
        manager.user = event.data.user;
        manager.notify();
      } else if (event.data.type === 'AUTH_LOGOUT') {
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

export const authManager = new AuthManager();
export type { User };
