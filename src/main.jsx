import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'

const isApp = window.location.pathname.startsWith('/app')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {isApp ? <App /> : <Landing />}
    </ErrorBoundary>
  </StrictMode>,
)
