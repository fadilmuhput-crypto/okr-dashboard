import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Landing from './Landing.jsx'

const isApp = window.location.pathname.startsWith('/app')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isApp ? <App /> : <Landing />}
  </StrictMode>,
)
