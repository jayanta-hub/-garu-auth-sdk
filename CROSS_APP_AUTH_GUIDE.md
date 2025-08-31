# 🔐 Cross-Application Authentication Implementation Guide

This guide explains how to implement and use cross-application authentication sharing with the enhanced Auth SDK.

## 🎯 What We've Built

A comprehensive authentication system that allows users to login once and access multiple applications seamlessly. The system supports:

1. **Same-Domain Applications** - Automatic sharing via cookies
2. **Cross-Domain Applications** - URL-based sharing
3. **Cross-Origin Communication** - Real-time sharing via postMessage API
4. **React Integration** - Built-in hooks and context providers

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   App 1         │    │   App 2         │    │   App 3         │
│   (Login)       │    │   (Dashboard)   │    │   (External)    │
│                 │    │                 │    │                 │
│  🔑 Login      │    │  📊 Dashboard   │    │  🌐 External    │
│  👤 User Info  │    │  👥 Users       │    │  📈 Analytics   │
│  🔗 Share Auth │    │  ⚙️ Settings    │    │  📊 Reports     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    Auth SDK                                │
    │  🍪 Cookies  |  🔗 URLs  |  📡 postMessage                │
    │  📱 Storage  |  ⏰ Expiry |  🔄 Sync                      │
    └─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### 1. Build the SDK

```bash
npm run build
```

### 2. Test Basic Functionality

Open `test.html` in your browser to verify the core authentication works.

### 3. Run the Demo Applications

1. **Main Demo**: Open `examples/demo.html`
2. **App 1**: Open `examples/app1-login.html`
3. **App 2**: Open `examples/app2-dashboard.html`

## 🔄 Authentication Sharing Methods

### Method 1: Same-Domain Sharing (Automatic)

**Best for**: Applications hosted on the same domain or subdomain.

**How it works**: Authentication is automatically shared via cookies.

```typescript
// App 1: Login
authManager.login(user, token);

// App 2: Automatically receives authentication
if (authManager.isLoggedIn()) {
  const user = authManager.getUser();
  console.log('Welcome,', user.name);
}
```

**Setup**: No additional setup required. Just ensure both apps use the same domain.

### Method 2: URL-Based Sharing (Cross-Domain)

**Best for**: Sharing authentication with external applications or different domains.

**How it works**: Generate a special URL with authentication parameters.

```typescript
// App 1: Generate auth URL
const authUrl = authManager.generateAuthUrl('https://app2.example.com/dashboard');
// Result: https://app2.example.com/dashboard?auth_token=...&auth_user=...&auth_timestamp=...

// App 2: Process auth from URL
if (authManager.processAuthFromUrl()) {
  console.log('Authentication received from URL');
}
```

**Use Cases**:
- Email links to external applications
- Deep linking from mobile apps
- Cross-domain authentication flows

### Method 3: Cross-Origin Communication

**Best for**: Real-time authentication sharing between different origins.

**How it works**: Use the postMessage API to share authentication data.

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

**Use Cases**:
- Embedded iframes
- Cross-origin popups
- Real-time synchronization

## ⚛️ React Integration

### Basic Setup

```typescript
import { AuthProvider, useAuth } from 'auth-sdk-random-12345';

function App() {
  return (
    <AuthProvider>
      <YourApp />
    </AuthProvider>
  );
}
```

### Using Authentication

```typescript
function Dashboard() {
  const { user, isLoggedIn, logout, shareAuth } = useAuth();
  
  if (!isLoggedIn) {
    return <LoginForm />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
      <button onClick={() => shareAuth('https://app2.example.com')}>
        Share with App 2
      </button>
    </div>
  );
}
```

## 🔧 Configuration Options

### Custom Auth Manager

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

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domain` | string | current hostname | Cookie domain for sharing |
| `secure` | boolean | auto-detect | HTTPS-only cookies |
| `sameSite` | string | 'lax' | Cookie same-site policy |
| `crossOriginEnabled` | boolean | true | Enable cross-origin sharing |
| `tokenExpiry` | number | 24 hours | Token expiry time in ms |

## 🛡️ Security Features

### Built-in Security

- **Token Expiry**: Automatic validation and cleanup
- **Secure Cookies**: HTTPS-only transmission
- **Same-Site Policy**: Configurable cookie security
- **Origin Validation**: postMessage origin checking
- **Timestamp Validation**: Prevents replay attacks

### Best Practices

1. **Use HTTPS**: Always use secure connections in production
2. **Set Appropriate Expiry**: Don't set tokens to expire too far in the future
3. **Validate Origins**: Only accept messages from trusted origins
4. **Clean Up**: Always call logout when user session ends
5. **Monitor**: Log authentication events for security monitoring

## 📱 Browser Support

### Supported Browsers

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+

### Required Features

- LocalStorage & SessionStorage
- Cookies with SameSite support
- BroadcastChannel API
- postMessage API
- URLSearchParams

## 🧪 Testing Your Implementation

### 1. Basic Authentication Test

```bash
# Open test.html in your browser
# Click "Test Login" to verify basic functionality
# Click "Test Logout" to verify cleanup
```

### 2. Cross-Application Test

```bash
# Open app1-login.html in one tab
# Login with any credentials
# Open app2-dashboard.html in another tab
# Verify automatic authentication
```

### 3. URL Sharing Test

```bash
# Login in app1
# Generate auth URL
# Copy URL and test in app2
# Verify URL-based authentication
```

### 4. Cross-Origin Test

```bash
# Open multiple tabs with different apps
# Login in one tab
# Verify real-time synchronization
```

## 🔍 Troubleshooting

### Common Issues

1. **Cookies Not Sharing**
   - Check domain configuration
   - Verify same-site policy
   - Ensure HTTPS in production

2. **Cross-Origin Errors**
   - Verify origin validation
   - Check postMessage implementation
   - Ensure proper error handling

3. **Authentication Not Persisting**
   - Check localStorage permissions
   - Verify cookie settings
   - Check browser privacy settings

### Debug Mode

Enable debug logging by checking the browser console for detailed information about authentication events.

## 📚 API Reference

### Core Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `login(user, token)` | Authenticate user | void |
| `logout()` | Clear authentication | void |
| `isLoggedIn()` | Check auth status | boolean |
| `getUser()` | Get current user | User \| null |
| `getToken()` | Get current token | string \| null |

### Sharing Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `generateAuthUrl(targetUrl)` | Generate auth URL | string |
| `processAuthFromUrl()` | Process URL auth | boolean |
| `shareAuthWithApp(origin, window)` | Share via postMessage | void |

### Configuration

| Method | Description | Returns |
|--------|-------------|---------|
| `new AuthManager(config)` | Create custom manager | AuthManager |
| `listenForExternalChanges()` | Setup listeners | void |

## 🚀 Production Deployment

### 1. Build the SDK

```bash
npm run build
```

### 2. Deploy Distribution Files

Copy the `dist/` folder to your web server.

### 3. Configure Your Applications

```typescript
// Production configuration
const authManager = new AuthManager({
  domain: '.yourdomain.com',
  secure: true,
  sameSite: 'strict',
  tokenExpiry: 3600000 // 1 hour
});
```

### 4. Monitor and Maintain

- Monitor authentication events
- Set up error tracking
- Regular security audits
- Update dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

## 🎉 Congratulations!

You now have a powerful cross-application authentication system! 

**Next Steps**:
1. Test the demo applications
2. Integrate into your existing projects
3. Customize configuration for your needs
4. Deploy to production

**Need Help?**
- Check the examples directory
- Review the API reference
- Create an issue on GitHub

**Happy coding! 🚀**
