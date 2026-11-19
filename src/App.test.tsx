import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { LocaleProvider } from './i18n/LocaleContext'
import { dockerSnippet } from './lib/release'

function renderApp() {
  return render(
    <LocaleProvider>
      <App />
    </LocaleProvider>,
  )
}

describe('marketing site interactions', () => {
  it('presents the launch promise, privacy model, browser access, and deployment path', () => {
    renderApp()

    expect(screen.getByText(/Self-hosted, single-user space for private records/)).toBeVisible()
    expect(screen.getByRole('img', { name: 'Sillage data flow' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Web interface' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Web' })).toHaveAttribute('href', '#web')
    expect(screen.getByText('interface languages')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Quick start' })).toHaveAttribute('href', '#deploy')
    expect(screen.getByRole('link', { name: 'Website repository' })).toHaveAttribute(
      'href',
      'https://github.com/getsillage/getsillage.github.io',
    )
    expect(screen.getByText('0', { selector: 'dt' })).toBeVisible()
    expect(screen.getByText('Sillage-hosted services')).toBeVisible()
    expect(
      screen.getByText(/data directory on the machine running Sillage/),
    ).toBeVisible()
    const codeBlock = document.querySelector('pre')
    expect(codeBlock?.textContent).toBe(dockerSnippet())
    expect(codeBlock).toHaveClass('w-full', 'max-w-full')
    expect(codeBlock?.parentElement?.parentElement).toHaveClass('min-w-0')
    expect(screen.getByRole('heading', { name: 'Run' }).closest('li')).toHaveClass(
      'grid-cols-[2rem_minmax(0,1fr)]',
    )
  })

  it('switches locale and theme and persists both choices', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Your records stay with you.Your answers come with sources.',
    )

    await user.click(screen.getByRole('button', { name: '中文' }))
    expect(document.documentElement).toHaveAttribute('lang', 'zh-CN')
    expect(localStorage.getItem('sillage-page-locale')).toBe('zh')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '记录由你自己保管。答案带着来源。',
    )
    expect(screen.getByRole('heading', { name: '浏览器访问' })).toBeVisible()
    expect(screen.getByText('种界面语言')).toBeVisible()
    expect(screen.getByRole('link', { name: '官网源码仓库' })).toHaveAttribute(
      'href',
      'https://github.com/getsillage/getsillage.github.io',
    )

    await user.click(screen.getByRole('button', { name: '切换到深色主题' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('sillage-page-theme')).toBe('dark')
  })

  it('moves focus into the mobile menu and restores it after Escape', async () => {
    const user = userEvent.setup()
    renderApp()
    const trigger = screen.getByRole('button', { name: 'Open menu' })

    await user.click(trigger)
    const menu = document.getElementById(trigger.getAttribute('aria-controls') ?? '')
    expect(menu).not.toBeNull()
    const firstItem = within(menu as HTMLElement).getByRole('link', { name: 'Features' })
    await waitFor(() => expect(firstItem).toHaveFocus())

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Close menu' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('copies the deployment command and reports clipboard failures', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const view = renderApp()

    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith(dockerSnippet())
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()

    view.unmount()
    writeText.mockRejectedValueOnce(new Error('permission denied'))
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Copy failed')
  })

  it('has no detectable automated accessibility violations', async () => {
    renderApp()
    const result = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
      },
    })
    expect(result.violations).toEqual([])
  })
})
