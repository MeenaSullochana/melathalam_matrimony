import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../admin/src/App.jsx'
import { AuthProvider } from '../admin/src/lib/auth.jsx'
import '../admin/src/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
