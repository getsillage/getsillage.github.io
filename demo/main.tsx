import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { App } from '../src/demo/product/app/App'
import { I18nProvider } from '../src/demo/product/i18n/I18nProvider'
import { setAccessToken } from '../src/demo/product/lib/auth'
import { installDemoTransport } from '../src/demo/transport'
import '../src/demo/product/styles/app.css'

const options = new URLSearchParams(window.location.search)
let locale: 'zh-CN' | 'en' = options.get('locale') === 'en' ? 'en' : 'zh-CN'
const requestedTheme = options.get('theme')
let theme = requestedTheme
try {
  if (localStorage.getItem('sillage-demo-preferences-initialized') !== '1') {
    localStorage.setItem('sillage-language', locale)
    if (requestedTheme === 'light' || requestedTheme === 'dark')
      localStorage.setItem('sillage-theme', requestedTheme)
    localStorage.setItem('sillage-demo-preferences-initialized', '1')
  }
  locale = localStorage.getItem('sillage-language') === 'en' ? 'en' : 'zh-CN'
  theme = localStorage.getItem('sillage-theme')
} catch {
  /* Preferences still work in memory if storage is unavailable. */
}
document.documentElement.classList.toggle(
  'dark',
  theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches),
)

const demo = installDemoTransport({ locale })
setAccessToken('demo-token')
const router = createHashRouter([{ path: '*', element: <App /> }])
const container = document.getElementById('root')
const appRoot = container ? createRoot(container) : null

appRoot?.render(
  <StrictMode>
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  </StrictMode>,
)

window.addEventListener('message', event => {
  if (
    event.origin !== window.location.origin ||
    event.source !== window.parent ||
    event.data?.type !== 'sillage-demo-reset'
  )
    return
  demo.reset()
  appRoot?.unmount()
  window.location.reload()
})
