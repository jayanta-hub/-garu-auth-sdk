import React, { useState, useEffect } from 'react';
import { authManager, User } from '../dist/index';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  shareAuth: (targetUrl: string) => string;
  processAuthFromUrl: () => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check initial auth status
    checkAuthStatus();

    // Subscribe to auth changes
    const unsubscribe = authManager.subscribe((user) => {
      setUser(user);
      setIsLoggedIn(!!user);
    });

    // Setup external auth listener
    authManager.constructor.listenForExternalChanges();

    // Process auth from URL if present
    if (authManager.processAuthFromUrl()) {
      console.log('Authentication received from URL!');
    }

    return unsubscribe;
  }, []);

  const checkAuthStatus = () => {
    const currentUser = authManager.getUser();
    const loggedIn = authManager.isLoggedIn();
    setUser(currentUser);
    setIsLoggedIn(loggedIn);
  };

  const login = async (email: string, password: string): Promise<void> => {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            role: 'admin'
          };
          
          const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiaWF0IjoxNjE2MjM5MDIyfQ.example';
          
          authManager.login(user, token);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };

  const logout = () => {
    authManager.logout();
  };

  const shareAuth = (targetUrl: string): string => {
    return authManager.generateAuthUrl(targetUrl);
  };

  const processAuthFromUrl = (): boolean => {
    return authManager.processAuthFromUrl();
  };

  const value: AuthContextType = {
    user,
    isLoggedIn,
    login,
    logout,
    shareAuth,
    processAuthFromUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Example Login Component
export const LoginForm: React.FC = () => {
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return <div>You are already logged in!</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Login</h2>
      
      <div style={styles.formGroup}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <button 
        type="submit" 
        disabled={loading}
        style={styles.button}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Example Dashboard Component
export const Dashboard: React.FC = () => {
  const { user, logout, shareAuth } = useAuth();
  const [shareUrl, setShareUrl] = useState('');

  const handleShareAuth = () => {
    try {
      const url = shareAuth('https://app2.example.com/dashboard');
      setShareUrl(url);
    } catch (error) {
      console.error('Failed to generate auth URL:', error);
    }
  };

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div style={styles.dashboard}>
      <h1>Welcome, {user.name}!</h1>
      
      <div style={styles.userInfo}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role || 'N/A'}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>

      <div style={styles.actions}>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
        
        <button onClick={handleShareAuth} style={styles.shareButton}>
          Share Auth with App 2
        </button>
      </div>

      {shareUrl && (
        <div style={styles.shareSection}>
          <h3>Auth URL Generated:</h3>
          <p style={styles.url}>{shareUrl}</p>
          <p>Copy this URL and open it in App 2 to automatically authenticate.</p>
        </div>
      )}

      <div style={styles.features}>
        <h3>Available Features:</h3>
        <ul>
          <li>📊 Analytics Dashboard</li>
          <li>👥 User Management</li>
          <li>⚙️ Settings Configuration</li>
          <li>📈 Performance Reports</li>
        </ul>
      </div>
    </div>
  );
};

// Example App Component
export const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>🚀 Multi-App Authentication Demo</h1>
        <p>This app demonstrates cross-application authentication sharing</p>
      </header>

      <main style={styles.main}>
        {isLoggedIn ? <Dashboard /> : <LoginForm />}
      </main>

      <footer style={styles.footer}>
        <p>Open another tab to test cross-application auth sharing</p>
      </footer>
    </div>
  );
};

// Styles
const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  main: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px',
    color: '#666'
  },
  form: {
    maxWidth: '400px',
    margin: '0 auto'
  },
  formGroup: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%'
  },
  error: {
    color: '#dc3545',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8d7da',
    borderRadius: '5px'
  },
  dashboard: {
    textAlign: 'center' as const
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px'
  },
  actions: {
    marginBottom: '30px'
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px'
  },
  shareButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  shareSection: {
    backgroundColor: '#e7f3ff',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px'
  },
  url: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '5px',
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
    border: '1px solid #ddd'
  },
  features: {
    textAlign: 'left' as const,
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px'
  }
};

export default App;
