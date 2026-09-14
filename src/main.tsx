import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureDefaultAdmin } from './lib/auth'
import { getDatabase } from './lib/db'

/**
 * Boot order matters: touch the store so the seed lands on a fresh browser,
 * then derive the starter admin's password hash (async, Web Crypto) before the
 * first paint. Rendering after both means the login screen never shows up in a
 * state where no account exists yet.
 */
getDatabase()

ensureDefaultAdmin()
  .catch((error: unknown) => {
    console.error('ไม่สามารถสร้างบัญชีผู้ดูแลเริ่มต้นได้', error)
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
