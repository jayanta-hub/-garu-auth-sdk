interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
}
declare class AuthManager {
    private user;
    private listeners;
    constructor();
    login(user: User, token: string): void;
    logout(): void;
    isLoggedIn(): boolean;
    getUser(): User | null;
    subscribe(listener: (user: User | null) => void): () => void;
    private notify;
    private broadcast;
    restoreSession(): void;
    static listenForExternalChanges(): void;
}
export declare const authManager: AuthManager;
export type { User };
//# sourceMappingURL=index.d.ts.map