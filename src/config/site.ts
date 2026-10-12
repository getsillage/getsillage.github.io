/** Deploy-time site URL without trailing slash. Set VITE_SITE_URL in CI/hosting. */
const envUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, '')

export const SITE = {
  name: 'Sillage',
  /** Empty when not configured; SEO absolute URLs fall back to relative paths. */
  url: envUrl ?? '',
  description:
    'Self-hosted, single-user space for private records, history review, and AI answers grounded in your own notes.',
  descriptionZh:
    '自托管的单人记录空间：保存日常记录、回看历史，并基于自己的记录进行 AI 总结与问答。',
  localeDefault: 'en' as const,
  githubOrg: 'getsillage',
  productRepo: 'getsillage/sillage',
  productRepoUrl: 'https://github.com/getsillage/sillage',
  websiteRepoUrl: 'https://github.com/getsillage/getsillage.github.io',
  /** Fallback when GitHub Releases cannot be reached at runtime. */
  defaultReleaseTag: 'v0.4.0',
  license: 'MIT',
} as const

export function absoluteUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (!SITE.url) return normalized
  return `${SITE.url}${normalized === '/' ? '' : normalized}`
}
