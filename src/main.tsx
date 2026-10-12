import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { AppErrorFallback, ErrorBoundary } from './shared/components/ErrorFallback'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary fallback={(error) => <AppErrorFallback error={error} />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
