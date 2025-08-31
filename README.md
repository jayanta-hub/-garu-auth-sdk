# 🔐 Cross-Application Authentication SDK

A powerful authentication SDK that allows you to share login information across multiple applications seamlessly. Perfect for microservices, multi-app architectures, and cross-domain authentication scenarios.

## ✨ Features

- **🔑 Single Sign-On (SSO)**: Login once, access multiple applications
- **🌐 Cross-Application Sharing**: Share authentication between different apps
- **🍪 Cookie-Based Sharing**: Automatic sharing for same-domain applications
- **🔗 URL-Based Sharing**: Share auth via URLs for cross-domain apps
- **📡 Cross-Origin Communication**: Real-time auth sharing via postMessage API
- **⏰ Token Expiry Management**: Automatic token validation and cleanup
- **📱 Multi-Tab Sync**: Keep authentication in sync across browser tabs
- **⚡ React Integration**: Built-in React hooks and context providers

## 🚀 Quick Start

### Installation

```bash
npm install auth-sdk-random-12345
```

### Basic Usage

```typescript
import { authManager } from 'auth-sdk-random-12345';

// Login user
authManager.login(user, token);

// Check if user is logged in
if (authManager.isLoggedIn()) {
  const user = authManager.getUser();
  console.log('Welcome,', user.name);
}

// Logout
authManager.logout();
```

## 🔄 Cross-Application Authentication Methods

### 1. 🍪 Same-Domain Sharing (Automatic)

When multiple applications are hosted on the same domain, authentication is automatically shared via cookies:

```typescript
// App 1: Login
authManager.login(user, token);

// App 2: Automatically receives authentication
if (authManager.isLoggedIn()) {
  // User is already authenticated!
  const user = authManager.getUser();
}
```

### 2. 🔗 URL-Based Sharing (Cross-Domain)

Generate authentication URLs to share login with other applications:

```typescript
// App 1: Generate auth URL
const authUrl = authManager.generateAuthUrl('https://app2.example.com/dashboard');
// Result: https://app2.example.com/dashboard?auth_token=...&auth_user=...&auth_timestamp=...

// App 2: Process auth from URL
if (authManager.processAuthFromUrl()) {
  // User is now authenticated!
  console.log('Authentication received from URL');
}
```

### 3. 📡 Cross-Origin Communication

Share authentication between different origins using postMessage API:

```typescript
// App 1: Share auth with another app
authManager.shareAuthWithApp('https://app2.example.com', targetWindow);

// App 2: Listen for auth sharing
window.addEventListener('message', (event) => {
  if (event.data.type === 'AUTH_SHARE') {
    const { token, user } = event.data.auth;
    // Process the shared authentication
  }
});
```

## ⚛️ React Integration

### Using the Auth Context

```typescript
import { AuthProvider, useAuth } from 'auth-sdk-random-12345';

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, isLoggedIn, logout, shareAuth } = useAuth();
  
  if (!isLoggedIn) {
    return <LoginForm />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => shareAuth('https://app2.example.com')}>
        Share with App 2
      </button>
    </div>
  );
}
```

### Custom Configuration

```typescript
import { AuthManager } from 'auth-sdk-random-12345';

const customAuthManager = new AuthManager({
  domain: '.example.com',           // Share cookies across subdomains
  secure: true,                     // HTTPS only
  sameSite: 'lax',                 // Cookie same-site policy
  crossOriginEnabled: true,         // Enable cross-origin sharing
  tokenExpiry: 3600000             // 1 hour token expiry
});
```

## 🏗️ Architecture Examples

### Example 1: Same-Domain Applications

```
https://app1.example.com (Login App)
https://app2.example.com (Dashboard)
https://app3.example.com (Admin Panel)
```

All apps automatically share authentication via cookies.

### Example 2: Cross-Domain Applications

```
https://app1.company.com (Login)
https://app2.company.com (Dashboard)
https://app3.partner.com (External Service)
```

Use URL-based sharing or cross-origin communication.

### Example 3: Microservices Architecture

```
Frontend App → Auth Service → User Service → Order Service
```

Each service can validate tokens and access user information.

## 📁 Project Structure

```
src/
├── index.ts                 # Main authentication manager
├── types.ts                 # TypeScript interfaces
└── utils.ts                 # Utility functions

examples/
├── app1-login.html         # Login application demo
├── app2-dashboard.html     # Dashboard application demo
└── ReactAuthExample.tsx    # React integration example

dist/                       # Built distribution files
```

## 🔧 Configuration Options

```typescript
interface AuthConfig {
  domain?: string;                    // Cookie domain (default: current hostname)
  secure?: boolean;                   // HTTPS only cookies (default: auto-detect)
  sameSite?: 'strict' | 'lax' | 'none'; // Cookie same-site policy
  crossOriginEnabled?: boolean;       // Enable cross-origin sharing
  tokenExpiry?: number;              // Token expiry time in milliseconds
}
```

## 🛡️ Security Features

- **Token Expiry**: Automatic token validation and cleanup
- **Secure Cookies**: HTTPS-only cookie transmission
- **Same-Site Policy**: Configurable cookie security policies
- **Cross-Origin Validation**: Origin validation for postMessage communication
- **Timestamp Validation**: Prevents replay attacks in URL-based sharing

## 📱 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Features Used**: 
  - LocalStorage & SessionStorage
  - Cookies with SameSite support
  - BroadcastChannel API
  - postMessage API
  - URLSearchParams

## 🚀 Getting Started with Examples

1. **Build the SDK**:
   ```bash
   npm run build
   ```

2. **Open App 1** (`examples/app1-login.html`):
   - Login with any credentials
   - See authentication sharing options

3. **Open App 2** (`examples/app2-dashboard.html`):
   - Automatically receives authentication from App 1
   - View user information and dashboard

4. **Test Cross-Application Features**:
   - Generate auth URLs for external apps
   - Test cross-origin communication
   - Verify multi-tab synchronization

## 🔍 API Reference

### Core Methods

- `login(user: User, token: string)`: Authenticate user
- `logout()`: Clear authentication
- `isLoggedIn()`: Check authentication status
- `getUser()`: Get current user information
- `getToken()`: Get current authentication token

### Sharing Methods

- `generateAuthUrl(targetUrl: string)`: Generate auth URL for sharing
- `processAuthFromUrl()`: Process auth from URL parameters
- `shareAuthWithApp(targetOrigin: string, targetWindow: Window)`: Share via postMessage

### Configuration

- `new AuthManager(config: AuthConfig)`: Create custom auth manager
- `listenForExternalChanges()`: Setup cross-tab and cross-origin listeners

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions and support:
- Create an issue on GitHub
- Check the examples directory for usage patterns
- Review the API reference above

---

**Happy coding! 🚀**
