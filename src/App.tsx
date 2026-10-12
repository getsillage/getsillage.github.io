import { Web } from './components/Web'
import { Deploy } from './components/Deploy'
import { Features } from './components/Features'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Privacy } from './components/Privacy'
import { useLocale } from './i18n/useLocale'

export default function App() {
  const { t } = useLocale()

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
