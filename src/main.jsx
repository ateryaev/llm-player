import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ConfigContextProvider } from './ConfigContext.jsx'

createRoot(document.getElementById('root')).render(
  <ConfigContextProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </ConfigContextProvider>,
)
