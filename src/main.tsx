import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import { initErrorReporting } from '@/services/errorReporting'
import { hydrate as hydrateStorage } from '@/services/storageService'
import './index.css'

async function bootstrap() {
  initErrorReporting()
  await hydrateStorage()
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary region="root">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}

bootstrap()