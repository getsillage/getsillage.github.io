// @vitest-environment node
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  contentSecurityPolicy,
  finalizeBuild,
  inlineScriptHashes,
  normalizeBase,
} from './postbuild.mjs'
import { checkDist } from './check-dist.mjs'

const temporaryDirectories: string[] = []

function fixtureDist(base = '/') {
  const root = mkdtempSync(join(tmpdir(), 'sillage-site-'))
  temporaryDirectories.push(root)
  const dist = join(root, 'dist')
  mkdirSync(dist)
  mkdirSync(join(dist, 'demo'))
  mkdirSync(join(dist, 'assets'))
  writeFileSync(join(dist, 'assets', 'demo.js'), 'export {}')
  writeFileSync(join(dist, 'assets', 'demo.css'), 'body { color: black; }')
  writeFileSync(
    join(dist, 'demo', 'index.html'),
    `<!doctype html><html><head><meta charset="UTF-8" /><meta name="robots" content="noindex" /><script>window.demoReady = true</script><script type="module" src="${base}assets/demo.js"></script><link rel="stylesheet" href="${base}assets/demo.css" /></head><body></body></html>`,
  )
  writeFileSync(
    join(dist, 'index.html'),
    `<!doctype html><html><head><meta charset="UTF-8" /><meta property="og:image" content="/og.png" /><meta name="twitter:image" content="/og.png" /><script>window.first = true</script><script type="application/ld+json">{"name":"Sillage"}</script></head><body></body></html>`,
  )
  writeFileSync(
    join(dist, '_headers'),
    `/*\n  X-Frame-Options: DENY\n  Content-Security-Policy: __SILLAGE_CSP__\n  Strict-Transport-Security: max-age=31536000\n  Cross-Origin-Resource-Policy: same-origin\n\n/index.html\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
  )
  return dist
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true })
})

describe('postbuild', () => {
  it('normalizes deploy base paths', () => {
    expect(normalizeBase('')).toBe('/')
    expect(normalizeBase('website')).toBe('/website/')
    expect(normalizeBase('/website/')).toBe('/website/')
  })

  it('generates script hashes without unsafe-inline', () => {
    const html = '<script>window.ready = true</script>'
    const hashes = inlineScriptHashes(html)
    expect(hashes).toHaveLength(1)
    expect(contentSecurityPolicy(html)).toContain(hashes[0])
    expect(contentSecurityPolicy(html)).not.toContain("'unsafe-inline'")
    expect(contentSecurityPolicy(html)).toContain("frame-src 'self'")
    expect(contentSecurityPolicy(html, true)).toContain("frame-ancestors 'self'")
    expect(contentSecurityPolicy(html)).toContain("style-src-attr 'none'")
  })

  it('writes absolute SEO URLs, deploy-aware 404s, and matching CSP hashes', () => {
    const dist = fixtureDist()
    const result = finalizeBuild({
      dist,
      siteUrl: 'https://getsillage.github.io',
      base: '/',
      requireSiteUrl: true,
      now: new Date('2026-07-30T00:00:00Z'),
    })
    const html = readFileSync(join(dist, 'index.html'), 'utf8')
    const headers = readFileSync(join(dist, '_headers'), 'utf8')
    const demoHtml = readFileSync(join(dist, 'demo', 'index.html'), 'utf8')
    const notFound = readFileSync(join(dist, '404.html'), 'utf8')

    expect(result.siteUrl).toBe('https://getsillage.github.io')
    expect(html).toContain('rel="canonical" href="https://getsillage.github.io/"')
    expect(html).toContain(
      'property="og:image" content="https://getsillage.github.io/og.png"',
    )
    for (const hash of inlineScriptHashes(html)) expect(headers).toContain(hash)
    for (const hash of inlineScriptHashes(demoHtml)) {
      expect(demoHtml).toContain(hash)
      expect(headers).toContain(hash)
      expect(html).not.toContain(hash)
    }
    expect(demoHtml).toContain('http-equiv="Content-Security-Policy"')
    expect(headers).toContain("frame-ancestors 'self'")
    expect(headers).toContain('X-Frame-Options: SAMEORIGIN')
    expect(headers).not.toContain('X-Frame-Options: DENY')
    expect(headers).not.toContain('__SILLAGE_CSP__')
    expect(notFound).toContain('content="0; url=/"')
    expect(notFound).not.toMatch(/<script\b|<style\b|\sstyle=/)
    expect(readFileSync(join(dist, 'sitemap.xml'), 'utf8')).toContain(
      '<loc>https://getsillage.github.io</loc>',
    )
    expect(() => checkDist({ dist, siteUrl: result.siteUrl })).not.toThrow()
  })

  it('preserves deploy-base paths for the demo assets and 404 redirect', () => {
    const dist = fixtureDist('/showcase/')
    finalizeBuild({ dist, base: '/showcase/', siteUrl: 'https://example.com/showcase' })
    const demoHtml = readFileSync(join(dist, 'demo', 'index.html'), 'utf8')
    expect(demoHtml).toContain('src="/showcase/assets/demo.js"')
    expect(demoHtml).toContain('href="/showcase/assets/demo.css"')
    expect(readFileSync(join(dist, '404.html'), 'utf8')).toContain('content="0; url=/showcase/"')
    expect(() => checkDist({ dist, base: '/showcase/', siteUrl: 'https://example.com/showcase' })).not.toThrow()
  })

  it('fails when the demo entrypoint is missing', () => {
    const dist = fixtureDist()
    rmSync(join(dist, 'demo', 'index.html'))
    expect(() => finalizeBuild({ dist })).toThrow('dist/demo/index.html missing')
  })

  it.each([
    ['demo/index.html', "frame-src 'self'", "frame-src 'self' https://example.com", "frame-src 'self'"],
    ['_headers', "frame-ancestors 'self'", 'frame-ancestors *', "frame-ancestors 'self'"],
    ['_headers', "frame-src 'self'", "frame-src 'self' https://example.com", "frame-src 'self'"],
    ['demo/index.html', 'src="/assets/demo.js"', 'src="https://example.com/assets/demo.js"', 'configured deploy base'],
  ])('rejects unsafe or invalid demo output in %s (%s)', (path, before, after, error) => {
    const dist = fixtureDist()
    finalizeBuild({ dist })
    const file = join(dist, path)
    writeFileSync(file, readFileSync(file, 'utf8').replace(before, after))
    expect(() => checkDist({ dist })).toThrow(error)
  })

  it('rejects a demo entrypoint without CSP metadata', () => {
    const dist = fixtureDist()
    finalizeBuild({ dist })
    const file = join(dist, 'demo', 'index.html')
    writeFileSync(file, readFileSync(file, 'utf8').replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, ''))
    expect(() => checkDist({ dist })).toThrow('demo/index.html has no CSP meta tag')
  })

  it('fails closed when production URL and base do not match', () => {
    const dist = fixtureDist()
    expect(() =>
      finalizeBuild({
        dist,
        siteUrl: 'https://example.com/subpath',
        base: '/',
        requireSiteUrl: true,
      }),
    ).toThrow('must match VITE_BASE')
  })
})
