/** Fail the build when deploy-critical HTML, SEO, redirects, or headers regress. */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { inlineScriptHashes, normalizeBase, normalizeSiteUrl } from './postbuild.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function fail(message) {
  throw new Error(`dist check failed: ${message}`)
}

function expectIncludes(value, fragment, label) {
  if (!value.includes(fragment)) fail(`${label} is missing ${fragment}`)
}

function expectDirective(csp, name, sources, label) {
  const directive = csp.split(';').map((value) => value.trim()).find((value) => value.startsWith(`${name} `))
  if (directive !== `${name} ${sources}`) fail(`${label} must use ${name} ${sources}`)
}

function validateHtmlCsp(html, label, headerCsp) {
  const cspMatch = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"\s*\/?>/i)
  if (!cspMatch) fail(`${label} has no CSP meta tag`)
  const metaCsp = cspMatch[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&')
  for (const [name, sources] of [
    ['default-src', "'self'"],
    ['connect-src', "'self' https://api.github.com"],
    ['frame-src', "'self'"],
    ['object-src', "'none'"],
    ['script-src-attr', "'none'"],
    ['style-src-attr', "'none'"],
  ]) {
    expectDirective(metaCsp, name, sources, `${label} meta CSP`)
    expectDirective(headerCsp, name, sources, 'header CSP')
  }
  if (metaCsp.includes("'unsafe-inline'") || headerCsp.includes("'unsafe-inline'")) {
    fail('CSP must not allow unsafe-inline')
  }
  for (const hash of inlineScriptHashes(html)) {
    expectIncludes(metaCsp, hash, `${label} meta CSP`)
    expectIncludes(headerCsp, hash, 'header CSP')
  }
  if (/\sstyle=/i.test(html)) fail(`${label} contains an inline style attribute`)
}

export function checkDist({
  dist = join(root, 'dist'),
  base: rawBase = process.env.VITE_BASE || '/',
  siteUrl: rawSiteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || '',
  requireSiteUrl = process.env.REQUIRE_SITE_URL === '1',
} = {}) {
  function read(relativePath) {
    const path = join(dist, relativePath)
    if (!existsSync(path)) fail(`${relativePath} is missing`)
    return readFileSync(path, 'utf8')
  }

  const html = read('index.html')
  const demoHtml = read('demo/index.html')
  const headers = read('_headers')
  const notFound = read('404.html')
  const robots = read('robots.txt')
  const sitemap = read('sitemap.xml')
  const base = normalizeBase(rawBase)
  const siteUrl = normalizeSiteUrl(rawSiteUrl)
  const headerMatch = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)
  if (!headerMatch) fail('_headers has no CSP response header')
  const headerCsp = headerMatch[1]

  validateHtmlCsp(html, 'index.html', headerCsp)
  validateHtmlCsp(demoHtml, 'demo/index.html', headerCsp)
  expectDirective(headerCsp, 'frame-ancestors', "'self'", 'header CSP')
  if (headers.includes('__SILLAGE_CSP__')) fail('CSP placeholder was not replaced')
  for (const required of [
    'X-Frame-Options: SAMEORIGIN',
    'Strict-Transport-Security: max-age=31536000',
    'Cross-Origin-Resource-Policy: same-origin',
    'Cache-Control: public, max-age=0, must-revalidate',
    'Cache-Control: public, max-age=31536000, immutable',
  ]) {
    expectIncludes(headers, required, '_headers')
  }

  const demoScripts = [...demoHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)]
  if (demoScripts.length === 0) fail('demo/index.html has no bundled script')
  for (const [, source] of demoScripts) {
    if (!source.startsWith(`${base}assets/`)) fail('demo script must use the configured deploy base')
    if (!existsSync(join(dist, source.slice(base.length)))) fail(`demo script ${source} is missing`)
  }
  for (const [, source] of demoHtml.matchAll(/<link\b[^>]*\bhref="([^"]+)"[^>]*>/gi)) {
    if (source.includes('/assets/')) {
      if (!source.startsWith(`${base}assets/`)) fail('demo asset must use the configured deploy base')
      if (!existsSync(join(dist, source.slice(base.length)))) fail(`demo asset ${source} is missing`)
    }
  }

  if (/<script\b/i.test(notFound) || /<style\b/i.test(notFound) || /\sstyle=/i.test(notFound)) {
    fail('404.html must not depend on inline script or style')
  }
  expectIncludes(notFound, `content="0; url=${base}"`, '404 redirect')
  expectIncludes(notFound, `href="${base}"`, '404 home link')

  if (requireSiteUrl && !siteUrl) fail('production build requires VITE_SITE_URL')
  if (siteUrl) {
    expectIncludes(html, `rel="canonical" href="${siteUrl}/"`, 'canonical URL')
    expectIncludes(html, `property="og:url" content="${siteUrl}/"`, 'Open Graph URL')
    expectIncludes(html, `property="og:image" content="${siteUrl}/og.png"`, 'Open Graph image')
    expectIncludes(html, `name="twitter:image" content="${siteUrl}/og.png"`, 'Twitter image')
    expectIncludes(robots, `Sitemap: ${siteUrl}/sitemap.xml`, 'robots.txt')
    expectIncludes(sitemap, `<loc>${siteUrl}</loc>`, 'sitemap.xml')
  } else {
    expectIncludes(robots, `Sitemap: ${base}sitemap.xml`, 'robots.txt')
    expectIncludes(sitemap, `<loc>${base}</loc>`, 'sitemap.xml')
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  checkDist()
  console.log('dist checks passed.')
}
