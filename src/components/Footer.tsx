import type { ReactNode } from 'react'
import { SITE } from '../config/site'
import { useLocale } from '../i18n/useLocale'
import { LINKS } from '../i18n/messages'
import { assetUrl } from '../lib/assets'
import { shellClass } from './ui'

export function Footer() {
  const { t } = useLocale()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200/80 bg-white/50 py-12 dark:border-gray-800/80 dark:bg-gray-950/50">
      <div className={shellClass}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <img src={assetUrl('sillage-icon.svg')} alt="" width={24} height={24} className="h-6 w-6" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">Sillage</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t.footerTagline}
            </p>
          </div>

          <FooterColumn title={t.footerProduct}>
            <FooterLink href={LINKS.github}>{t.footerGithub}</FooterLink>
            <FooterLink href={LINKS.releases}>{t.footerReleases}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t.footerResources}>
            <FooterLink href={LINKS.docs}>{t.footerDocs}</FooterLink>
            <FooterLink href={LINKS.deployment}>{t.footerDeploy}</FooterLink>
            <FooterLink href={LINKS.data}>{t.footerData}</FooterLink>
            <FooterLink href={LINKS.ai}>{t.footerAi}</FooterLink>
          </FooterColumn>

          <FooterColumn title={t.footerCommunity}>
            <FooterLink href={LINKS.security}>{t.footerSecurity}</FooterLink>
            <FooterLink href={LINKS.contributing}>{t.footerContributing}</FooterLink>
            <FooterLink href={LINKS.brand}>{t.footerBrand}</FooterLink>
            <FooterLink href={LINKS.license}>{t.footerLicense}</FooterLink>
            <FooterLink href={SITE.websiteRepoUrl}>{t.footerWebsiteRepository}</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-gray-200/80 pt-6 text-xs text-gray-400 dark:border-gray-800/80 dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. {t.footerRights}
          </p>
          <p>{t.footerNoHosted}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-gray-600 transition hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/35 dark:text-gray-300 dark:hover:text-gray-50"
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    </li>
  )
}
