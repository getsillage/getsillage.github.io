import { useLocale } from '../i18n/useLocale'
import { LINKS } from '../i18n/messages'
import { linkClass, sectionLeadClass, sectionTitleClass, shellClass } from './ui'

export function Web() {
  const { t } = useLocale()

  return (
    <section
      id="web"
      className="scroll-mt-20 border-t border-gray-200/80 bg-white/55 py-16 dark:border-gray-800/80 dark:bg-gray-950/35 sm:py-24"
    >
      <div className={shellClass}>
        <div className="max-w-2xl">
          <h2 className={sectionTitleClass}>{t.webTitle}</h2>
          <p className={sectionLeadClass}>{t.webLead}</p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-900/[0.04] dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2">
          <WebVisual />
          <div className="min-w-0 p-6 sm:p-8">
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{t.webBody}</p>
            <ul className="mt-5 space-y-2.5">
              {t.webPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  <span className="mt-2.5 h-1 w-1 flex-none rounded-full bg-brand-glimmer" aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <a href={LINKS.docs} className={linkClass} target="_blank" rel="noreferrer">
                {t.ctaDocs} →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function WebVisual() {
  return (
    <div className="flex min-w-0 items-center border-b border-gray-200/80 bg-gray-100/70 p-6 dark:border-gray-800 dark:bg-gray-950/60 sm:p-8 md:border-b-0 md:border-r" aria-hidden>
      <div className="mx-auto h-52 w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-900/[0.06] dark:border-gray-700 dark:bg-gray-900">
        <div className="flex h-7 items-center gap-1.5 border-b border-gray-100 px-2.5 dark:border-gray-800">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
          <span className="ml-2 h-2 w-20 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
        <div className="grid h-[calc(100%_-_1.75rem)] grid-cols-[5.5rem_minmax(0,1fr)]">
          <div className="border-r border-gray-100 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-950">
            <div className="h-2 w-12 rounded bg-brand-trail/25 dark:bg-brand-echo/25" />
            <div className="mt-4 h-2 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-2 w-4/5 rounded bg-gray-200/70 dark:bg-gray-800/70" />
          </div>
          <div className="p-3">
            <div className="h-2 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-3 h-11 rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950" />
            <div className="mt-3 h-2 w-full rounded bg-gray-100 dark:bg-gray-800" />
            <div className="mt-2 h-2 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
