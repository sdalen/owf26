import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Be nettleseren om ikke å rydde bort lagrede markeringer når enheten får lite plass
void navigator.storage?.persisted?.().then((persisted) => {
  if (!persisted) void navigator.storage.persist()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
