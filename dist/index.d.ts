interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}
interface AuthConfig {
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    crossOriginEnabled?: boolean;
    tokenExpiry?: number;
}
declare class AuthManager {
    private user;
    private listeners;
    private config;
    private tokenExpiryTime;
    constructor(config?: AuthConfig);
    login(user: User, token: string): void;
    logout(): void;
    isLoggedIn(): boolean;
    getUser(): User | null;
    getToken(): string | null;
    generateAuthUrl(targetUrl: string): string;
    processAuthFromUrl(): boolean;
    shareAuthWithApp(targetOrigin: string, targetWindow: Window): void;
    subscribe(listener: (user: User | null) => void): () => void;
    private notify;
    private broadcast;
    private restoreSession;
    private setupCrossOriginListener;
    private setCookie;
    private getCookie;
    private deleteCookie;
    static listenForExternalChanges(): void;
}
export declare const authManager: AuthManager;
export type { User, AuthConfig };
//# sourceMappingURL=index.d.ts.map