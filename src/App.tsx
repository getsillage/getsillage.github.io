import { lazy, Suspense, useEffect, useState } from 'react'
import { Web } from './components/Web'
import { Deploy } from './components/Deploy'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Privacy } from './components/Privacy'
import { useLocale } from './i18n/useLocale'

const DemoPage = lazy(() => import('./demo/DemoPage'))

export default function App() {
  const { t } = useLocale()
  const [isDemo, setIsDemo] = useState(() => window.location.hash === '#/demo')

  useEffect(() => {
    const onHashChange = () => {
      setIsDemo(window.location.hash === '#/demo')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (isDemo) {
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
      } else {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView?.()
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [isDemo])

  if (isDemo) {
    return (
      <Suspense
        fallback={
          <div className="p-8" role="status">
            {t.previewLoading}
          </div>
        }
      >
        <DemoPage />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow-lg dark:focus:bg-gray-900"
      >
        {t.skipToContent}
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Features />
        <Privacy />
        <Web />
        <Deploy />
      </main>
      <Footer />
    </div>
  )
}
