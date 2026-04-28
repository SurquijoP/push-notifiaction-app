import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Falta VITE_CLERK_PUBLISHABLE_KEY en .env')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <div className="app-wrapper">
        <header className="header">
          <div className="header-content">
            <h2>Push Notifications App</h2>
            <div className="auth-section">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="sign-in-btn">Iniciar Sesión</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </header>
        
        <main>
          <App />
        </main>
      </div>
    </ClerkProvider>
  </React.StrictMode>,
)
