import { useLocale } from '../i18n/useLocale'
import { LINKS } from '../i18n/messages'
import { assetUrl } from '../lib/assets'
import { primaryButtonClass, secondaryButtonClass, shellClass } from './ui'
import { ProductPreview } from './ProductPreview'

export function Hero() {
  const { t } = useLocale()

  return (
    <section className="hero-glow relative overflow-hidden" id="top">
      <div className={`${shellClass} pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20`}>
        <div className="section-enter grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(26rem,0.98fr)] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-brand-trail/15 bg-white/65 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-trail shadow-sm shadow-gray-900/[0.03] backdrop-blur dark:border-brand-echo/20 dark:bg-gray-900/65 dark:text-brand-echo">
              <img
                src={assetUrl('sillage-icon.svg')}
                alt=""
                width={22}
                height={22}
                className="h-[1.375rem] w-[1.375rem]"
              />
              {t.heroEyebrow}
            </div>
            <h1 className="mt-6 text-balance text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.04em] text-gray-950 sm:text-5xl lg:text-[3.6rem] dark:text-white">
              <span className="block">{t.heroTitle}</span>
              <span className="mt-1 block text-brand-trail dark:text-brand-echo">
                {t.heroTitleSecond}
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-gray-600 sm:text-lg sm:leading-8 dark:text-gray-300">
              {t.heroLead}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#/demo" className={secondaryButtonClass}>
                {t.navDemo} <span aria-hidden="true">↗</span>
              </a>
              <a href="#deploy" className={primaryButtonClass}>
                {t.ctaDeploy}
              </a>
              <a
                href={LINKS.github}
                className={secondaryButtonClass}
                target="_blank"
                rel="noreferrer"
              >
                {t.ctaGithub}
              </a>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              {t.heroProofs.map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-glimmer" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <ProductPreview />
        </div>

        <div className="mt-14 border-t border-gray-200/80 pt-8 dark:border-gray-800/80 sm:mt-16 sm:pt-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
              {t.flowTitle}
            </span>
            <span className="h-px flex-1 bg-gray-200/80 dark:bg-gray-800/80" aria-hidden />
          </div>
          <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
            {t.flowSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-mono text-xs text-brand-warm dark:text-brand-glimmer">
                  0{index + 1}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                    {step.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
