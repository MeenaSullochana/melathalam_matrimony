import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../matri/src/App.jsx'
import { AuthProvider } from '../matri/src/auth.jsx'
import { LanguageProvider } from '../matri/src/i18n/LanguageContext.jsx'
import '../matri/src/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
