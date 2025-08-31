# auth-sdk-random-12345

Authentication SDK for sharing login state with functional React components and hooks

## Installation

```bash
npm install auth-sdk-random-12345
```

## Development

### Prerequisites

- Node.js 18+ 
- npm 9+

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

- `npm run build` - Build the project for production
- `npm run dev` - Build the project in watch mode for development
- `npm run test` - Run tests
- `npm run lint` - Lint the source code

### Build Output

The build process generates:
- `dist/index.js` - CommonJS bundle
- `dist/index.mjs` - ES Module bundle
- `dist/index.d.ts` - TypeScript declarations

## Usage

### Functional Components (Recommended)

```typescript
import React from 'react';
import { useAuth, AuthProvider, withAuth } from 'auth-sdk-random-12345';

// Use the hook in your components
const MyComponent = () => {
  const { user, login, logout, isLoggedIn } = useAuth();
  
  return (
    <div>
      {isLoggedIn ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(userData, token)}>Login</button>
      )}
    </div>
  );
};

// Wrap your app with AuthProvider
const App = () => (
  <AuthProvider>
    <MyComponent />
  </AuthProvider>
);

// Protect routes with HOC
const ProtectedPage = withAuth(() => <div>Protected Content</div>);
```

### Available Hooks

- `useAuth()` - Main authentication hook
- `useProtectedRoute()` - Hook for route protection
- `useAuthStateChange(callback)` - Hook for auth state changes

### Available Components

- `AuthProvider` - Context provider for authentication state
- `withAuth(Component)` - HOC for protecting components

### Class-based Usage (Legacy)

```typescript
import { authManager } from 'auth-sdk-random-12345';

// Direct usage
authManager.login(user, token);
const isLoggedIn = authManager.isLoggedIn;
```

## Features

- ✅ Functional React hooks and components
- ✅ Cross-tab authentication synchronization
- ✅ Local storage persistence
- ✅ TypeScript support
- ✅ Protected route HOC
- ✅ Event-driven architecture
- ✅ Singleton pattern for global state

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT
