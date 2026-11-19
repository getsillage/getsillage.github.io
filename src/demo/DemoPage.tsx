import { useRef, useState } from 'react'
import { useLocale } from '../i18n/useLocale'
import { useTheme } from '../hooks/useTheme'
import { assetUrl } from '../lib/assets'

/** The product runs in its own document so its original CSS stays unchanged. */
export default function DemoPage() {
  const { locale } = useLocale()
  const { theme } = useTheme()
  const frame = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)
  const zh = locale === 'zh'
  const src = `${assetUrl('demo/index.html')}?locale=${zh ? 'zh-CN' : 'en'}&theme=${theme}`

  return (
    <main className="flex h-dvh min-h-[320px] flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-100 px-3 py-2 text-[11px] sm:flex-nowrap sm:px-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <strong className="font-medium">{zh ? '体验空间' : 'Demo space'}</strong>
          <span className="hidden text-gray-600 sm:inline dark:text-gray-300">
            {zh
              ? '示例数据 · 操作仅保存在此浏览器 · 问答不调用 AI'
              : 'Sample data · Changes stay in this browser · No AI calls'}
          </span>
        </div>
        <nav className="flex items-center gap-4" aria-label={zh ? '体验导航' : 'Demo navigation'}>
          <button
            type="button"
            className="cursor-pointer text-gray-600 underline-offset-4 hover:underline disabled:opacity-50 dark:text-gray-300"
            disabled={!loaded}
            onClick={() =>
              frame.current?.contentWindow?.postMessage(
                { type: 'sillage-demo-reset' },
                window.location.origin,
              )
            }
          >
            {zh ? '重置体验' : 'Reset demo'}
          </button>
          <a
            href="#top"
            className="text-gray-600 underline-offset-4 hover:underline dark:text-gray-300"
          >
            {zh ? '返回官网' : 'Back to website'}
          </a>
          <a href="#deploy" className="font-medium underline-offset-4 hover:underline">
            {zh ? '自行部署' : 'Deploy Sillage'}
          </a>
        </nav>
      </header>
      <iframe
        ref={frame}
        src={src}
        title={zh ? 'Sillage 正式版界面体验' : 'Sillage product demo'}
        className="block min-h-0 w-full flex-1 border-0"
        onLoad={() => setLoaded(true)}
      />
    </main>
  )
}
