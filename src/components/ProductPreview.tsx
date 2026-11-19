import { useLocale } from '../i18n/useLocale'
import { assetUrl } from '../lib/assets'

/** Decorative UI sketch of the product — not a live screenshot. */
export function ProductPreview() {
  const { locale, t } = useLocale()
  const isZh = locale === 'zh'

  const nav = isZh
    ? [
        { label: '写记录', active: true },
        { label: '全部记录', active: false },
      ]
    : [
        { label: 'Write', active: true },
        { label: 'All Records', active: false },
      ]

  const items = isZh
    ? [
        { date: '今天', body: '傍晚沿着河边走了一圈，风很轻。' },
        { date: '昨天', body: '把本周想做的几件事写下来，先从最简单的开始。' },
        { date: '周一', body: '读完一章旧笔记，发现有些问题已经自己解开了。' },
      ]
    : [
        {
          date: 'Today',
          body: 'A quiet walk by the river. The wind was light.',
        },
        {
          date: 'Yesterday',
          body: 'Listed a few things for the week — start with the small ones.',
        },
        {
          date: 'Monday',
          body: 'Re-read an old note. Some questions had already settled.',
        },
      ]

  const askTitle = isZh ? '开始问答' : 'Start Ask'
  const askHint = isZh
    ? '基于最近的记录，有什么反复出现的主题？'
    : 'What themes keep showing up in recent records?'
  const sourceLabel = isZh ? '来源' : 'Sources'

  return (
    <div className="product-preview preview-float relative mx-auto w-full max-w-[34rem] lg:justify-self-end">
      <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-trail/[0.08] via-transparent to-brand-glimmer/[0.08] blur-2xl dark:from-brand-echo/10 dark:to-brand-glimmer/5" />
      <div
        role="img"
        aria-label={t.previewLabel}
        className="overflow-hidden rounded-[1.35rem] border border-gray-200/90 bg-white shadow-2xl shadow-gray-900/[0.1] dark:border-gray-700/80 dark:bg-gray-900 dark:shadow-black/45"
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-gray-800 dark:bg-gray-950/60">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5f]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f4b942]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4fc06d]" />
          <div className="ml-2 flex flex-1 items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1 text-[11px] text-gray-400 dark:bg-gray-950 dark:text-gray-500">
              <img
                src={assetUrl('sillage-icon.svg')}
                alt=""
                className="h-3.5 w-3.5"
                width={14}
                height={14}
              />
              localhost:5231
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-[10rem_1fr]">
          {/* Sidebar */}
          <aside className="hidden border-r border-gray-100 bg-gray-50/80 p-3 dark:border-gray-800 dark:bg-gray-950/50 sm:block">
            <div className="mb-4 flex items-center gap-2 px-2 pt-1">
              <img
                src={assetUrl('sillage-icon.svg')}
                alt=""
                className="h-5 w-5"
                width={20}
                height={20}
              />
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                Sillage
              </span>
            </div>
            <ul className="space-y-1">
              {nav.map(item => (
                <li
                  key={item.label}
                  className={
                    item.active
                      ? 'rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-50'
                      : 'rounded-lg px-2.5 py-2 text-xs text-gray-500 dark:text-gray-400'
                  }
                >
                  {item.label}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg border border-dashed border-gray-200 px-2.5 py-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
              {askTitle}
            </div>
          </aside>

          {/* Main column */}
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  {isZh ? '写记录' : 'Write a Record'}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  {isZh ? '今天' : 'Today'}
                </p>
              </div>
              <span className="rounded-md bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white dark:bg-gray-100 dark:text-gray-900">
                {isZh ? '保存' : 'Save'}
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-gray-950/40">
              <div className="h-2 w-3/5 max-w-[12rem] rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-2 h-2 w-full rounded bg-gray-200/80 dark:bg-gray-800/80" />
              <div className="mt-2 h-2 w-4/5 rounded bg-gray-200/70 dark:bg-gray-800/70" />
            </div>

            <ul className="mt-4 space-y-2.5">
              {items.map(item => (
                <li
                  key={item.date}
                  className="rounded-xl border border-gray-100 px-3 py-2.5 dark:border-gray-800"
                >
                  <p className="text-[11px] text-gray-400">{item.date}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl border border-brand-trail/15 bg-gradient-to-br from-brand-trail/[0.06] to-brand-glimmer/[0.05] p-3 dark:border-brand-echo/20 dark:from-brand-echo/10 dark:to-brand-glimmer/5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-glimmer" aria-hidden />
                <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                  {askHint}
                </p>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] text-gray-500 ring-1 ring-gray-200 dark:bg-gray-900/80 dark:text-gray-400 dark:ring-gray-700">
                  {sourceLabel} · 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-gray-400 dark:text-gray-500 lg:text-right">
        {t.previewCaption}
        {' · '}
        <a
          href="#/demo"
          className="underline underline-offset-4 hover:text-brand-trail dark:hover:text-brand-echo"
        >
          {t.navDemo} ↗
        </a>
      </p>
    </div>
  )
}
