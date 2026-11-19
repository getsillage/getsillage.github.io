/** Finalize dist/ with deploy-aware SEO, redirects, and a hash-based CSP. */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export function normalizeBase(rawBase = '/') {
  const trimmed = rawBase.trim()
  if (!trimmed || trimmed === '/') return '/'
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}

export function normalizeSiteUrl(rawUrl = '') {
  const trimmed = rawUrl.trim().replace(/\/$/, '')
  if (!trimmed) return ''
  const parsed = new URL(trimmed)
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      'VITE_SITE_URL must be an absolute HTTP(S) origin/path without credentials, query, or hash',
    )
  }
  return parsed.toString().replace(/\/$/, '')
}

export function inlineScriptHashes(html) {
  const hashes = []
  const scriptPattern = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of html.matchAll(scriptPattern)) {
    const digest = createHash('sha256').update(match[1]).digest('base64')
    hashes.push(`'sha256-${digest}'`)
  }
  return [...new Set(hashes)]
}

export function contentSecurityPolicy(html, includeFrameAncestors = false) {
  const hashes = inlineScriptHashes(html)
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https://api.github.com",
    "font-src 'self'",
    "form-action 'self'",
    "frame-src 'self'",
    "img-src 'self' data:",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    "script-src-attr 'none'",
    "style-src 'self'",
    "style-src-attr 'none'",
    "worker-src 'self'",
  ]
  if (includeFrameAncestors) directives.splice(6, 0, "frame-ancestors 'self'")
  return directives.join('; ')
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function upsertMeta(html, attribute, name, content) {
  const pattern = new RegExp(`<meta\\s+${attribute}="${name}"[^>]*>`, 'i')
  const tag = `<meta ${attribute}="${name}" content="${escapeAttribute(content)}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function upsertCanonical(html, href) {
  const pattern = /<link\s+rel="canonical"[^>]*>/i
  const tag = `<link rel="canonical" href="${escapeAttribute(href)}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

function injectCspMeta(html) {
  const csp = contentSecurityPolicy(html)
  const tag = `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(csp)}" />`
  const existing = /<meta\s+http-equiv="Content-Security-Policy"[^>]*>/i
  if (existing.test(html)) return html.replace(existing, tag)
  return html.replace(/(<meta\s+charset="[^"]+"\s*\/?>)/i, `$1\n    ${tag}`)
}

function writeNotFoundPage(dist, base, metaCsp) {
  const home = base
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${escapeAttribute(metaCsp)}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${escapeAttribute(home)}" />
    <title>Page not found — Sillage</title>
    <link rel="icon" href="${base}favicon.ico" sizes="any" />
  </head>
  <body>
    <p><a href="${escapeAttribute(home)}">Sillage</a> — redirecting home…</p>
  </body>
</html>
`
  writeFileSync(join(dist, '404.html'), html)
}

export function finalizeBuild({
  dist,
  siteUrl = '',
  base = '/',
  requireSiteUrl = false,
  now = new Date(),
}) {
  if (!existsSync(dist)) throw new Error('dist/ missing — run vite build first')

  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  const normalizedBase = normalizeBase(base)
  if (requireSiteUrl && !normalizedSiteUrl) {
    throw new Error('VITE_SITE_URL is required for a production build')
  }
  if (normalizedSiteUrl && !normalizedSiteUrl.startsWith('https://')) {
    throw new Error('VITE_SITE_URL must use HTTPS')
  }
  if (normalizedSiteUrl) {
    const sitePath = new URL(normalizedSiteUrl).pathname.replace(/\/$/, '') || '/'
    const basePath = normalizedBase === '/' ? '/' : normalizedBase.replace(/\/$/, '')
    if (sitePath !== basePath) {
      throw new Error(`VITE_SITE_URL path (${sitePath}) must match VITE_BASE (${basePath})`)
    }
  }

  const robots = normalizedSiteUrl
    ? `User-agent: *\nAllow: /\n\nSitemap: ${normalizedSiteUrl}/sitemap.xml\n`
    : `User-agent: *\nAllow: /\n\nSitemap: ${normalizedBase}sitemap.xml\n`
  const loc = normalizedSiteUrl || normalizedBase
  const lastmod = now.toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`
  writeFileSync(join(dist, 'robots.txt'), robots)
  writeFileSync(join(dist, 'sitemap.xml'), sitemap)

  const indexPath = join(dist, 'index.html')
  if (!existsSync(indexPath)) throw new Error('dist/index.html missing')
  let html = readFileSync(indexPath, 'utf8')
  if (normalizedSiteUrl) {
    html = upsertCanonical(html, `${normalizedSiteUrl}/`)
    html = upsertMeta(html, 'property', 'og:url', `${normalizedSiteUrl}/`)
    html = upsertMeta(html, 'property', 'og:image', `${normalizedSiteUrl}/og.png`)
    html = upsertMeta(html, 'name', 'twitter:image', `${normalizedSiteUrl}/og.png`)
  }
  html = injectCspMeta(html)
  writeFileSync(indexPath, html)

  const demoPath = join(dist, 'demo', 'index.html')
  if (!existsSync(demoPath)) throw new Error('dist/demo/index.html missing')
  const demoHtml = injectCspMeta(readFileSync(demoPath, 'utf8'))
  writeFileSync(demoPath, demoHtml)

  // The shared response header must authorize inline hashes from both entrypoints.
  const headerCsp = contentSecurityPolicy(`${html}\n${demoHtml}`, true)
  const headersPath = join(dist, '_headers')
  if (!existsSync(headersPath)) throw new Error('dist/_headers missing')
  const headers = readFileSync(headersPath, 'utf8')
  if (!headers.includes('__SILLAGE_CSP__')) {
    throw new Error('dist/_headers is missing the CSP placeholder')
  }
  writeFileSync(
    headersPath,
    headers
      .replaceAll('__SILLAGE_CSP__', headerCsp)
      .replace(/^([ \t]*X-Frame-Options:[ \t]*)DENY[ \t]*$/gm, '$1SAMEORIGIN'),
  )
  writeNotFoundPage(dist, normalizedBase, contentSecurityPolicy(''))

  return { siteUrl: normalizedSiteUrl, base: normalizedBase, csp: headerCsp }
}

function main() {
  const result = finalizeBuild({
    dist: join(root, 'dist'),
    siteUrl: process.env.VITE_SITE_URL || process.env.SITE_URL || '',
    base: process.env.VITE_BASE || '/',
    requireSiteUrl: process.env.REQUIRE_SITE_URL === '1',
  })
  console.log(
    result.siteUrl
      ? `postbuild: site URL → ${result.siteUrl}`
      : `postbuild: no VITE_SITE_URL; SEO paths use ${result.base}`,
  )
  console.log('postbuild: CSP, redirects, robots, and sitemap finalized')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
