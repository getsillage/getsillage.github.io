import { useEffect, useId, useRef, useState } from 'react'
import { useLocale } from '../i18n/useLocale'
import { LINKS } from '../i18n/messages'
import { useTheme } from '../hooks/useTheme'
import { assetUrl } from '../lib/assets'
import { ghostButtonClass, iconButtonClass, shellClass } from './ui'

const NAV_HREFS = [
  { href: '#features', key: 'navFeatures' as const },
  { href: '#privacy', key: 'navPrivacy' as const },
  { href: '#web', key: 'navWeb' as const },
]

export function Header() {
  const { locale, setLocale, t } = useLocale()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const focusFrame = window.requestAnimationFrame(() => firstMenuItemRef.current?.focus())
    return () => {
      document.removeEventListener('keydown', onKey)
      window.cancelAnimationFrame(focusFrame)
    }
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-gray-50/90 backdrop-blur-xl dark:border-gray-800/80 dark:bg-gray-950/90">
      <div className={`${shellClass} flex h-16 items-center justify-between gap-3`}>
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/40"
          onClick={closeMenu}
        >
          <img
            src={assetUrl('sillage-icon.svg')}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span>
            <span className="block text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50">
              Sillage
            </span>
            <span className="hidden text-[0.625rem] text-gray-400 dark:text-gray-500 sm:block">
              {t.footerTagline}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t.navAria}>
          {NAV_HREFS.map(item => (
            <a key={item.href} href={item.href} className={ghostButtonClass}>
              {t[item.key]}
            </a>
          ))}
          <a href="#/demo" className={ghostButtonClass}>
            {t.navDemo}
          </a>
          <a
            href="#deploy"
            className="ml-1 inline-flex h-9 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/45 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
          >
            {t.navDeploy}
          </a>
        </nav>

        <div className="flex items-center gap-1">
          <div
            className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-100/70 p-0.5 dark:border-gray-800 dark:bg-gray-950"
            role="group"
            aria-label={t.langLabel}
          >
            <button
              type="button"
              className={locale === 'en' ? segmentedActive : segmentedIdle}
              onClick={() => setLocale('en')}
              aria-pressed={locale === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={locale === 'zh' ? segmentedActive : segmentedIdle}
              onClick={() => setLocale('zh')}
              aria-pressed={locale === 'zh'}
            >
              中文
            </button>
          </div>

          <button
            type="button"
            className={iconButtonClass}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            href={LINKS.github}
            className={`${iconButtonClass} hidden sm:inline-flex`}
            target="_blank"
            rel="noreferrer"
            aria-label={t.footerGithub}
          >
            <GitHubIcon />
          </a>

          <button
            ref={menuButtonRef}
            type="button"
            className={`${iconButtonClass} md:hidden`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t.menuClose : t.menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id={menuId}
          className="border-t border-gray-200/80 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 md:hidden"
        >
          <nav className={`${shellClass} flex flex-col gap-1 py-3`} aria-label={t.navAria}>
            {NAV_HREFS.map(item => (
              <a
                ref={item === NAV_HREFS[0] ? firstMenuItemRef : undefined}
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
                onClick={closeMenu}
              >
                {t[item.key]}
              </a>
            ))}
            <a
              href="#deploy"
              className="rounded-lg bg-gray-900 px-3 py-3 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900"
              onClick={closeMenu}
            >
              {t.navDeploy}
            </a>
            <a
              href="#/demo"
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-200"
              onClick={closeMenu}
            >
              {t.navDemo}
            </a>
            <a
              href={LINKS.github}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-900"
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
            >
              {t.footerGithub}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

const segmentedIdle =
  'inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-gray-500 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/35 dark:text-gray-400 dark:hover:text-gray-100'

const segmentedActive =
  'inline-flex h-8 items-center rounded-md bg-white px-2.5 text-xs font-medium text-gray-900 shadow-sm shadow-gray-900/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/35 dark:bg-gray-800 dark:text-gray-50'

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .267.18.578.688.48A10.01 10.01 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}
