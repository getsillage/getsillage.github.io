import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAskConversation,
  createMemo,
  deleteMemo,
  generateMemoSummary,
  getAISettings,
  getAskConversation,
  getBootstrap,
  getMe,
  getMemo,
  listAskConversations,
  listAskMessages,
  listMemos,
  purgeMemo,
  restoreMemo,
  searchMemos,
  setAskConversationArchived,
  setAskHead,
  setMemoArchived,
  setMemoFavorited,
  streamAskMessage,
  updateMemo,
  uploadAttachment,
  type AskMessage,
} from './product/lib/api'
import { demoRecords } from './data'
import { EntryComposer } from './product/features/memos/EntryComposer'
import { I18nProvider } from './product/i18n/I18nProvider'
import { installDemoTransport } from './transport'

const token = 'demo-token'
const question = 'What have I mentioned repeatedly lately?'
let transport: ReturnType<typeof installDemoTransport>

beforeEach(() => {
  transport = installDemoTransport({ locale: 'en' })
})
afterEach(() => {
  transport.restore()
})

async function sendQuestion(conversationId: string, content = question) {
  let answer: AskMessage | undefined
  const deltas: string[] = []
  await streamAskMessage(
    token,
    conversationId,
    { content, contextScope: 'all' },
    {
      onDelta: text => deltas.push(text),
      onDone: message => {
        answer = message
      },
    },
  )
  expect(answer).toBeDefined()
  expect(deltas.join('')).toBe(answer?.content)
  return answer as AskMessage
}

describe('local demo transport with the production API client', () => {
  it('lists a new capture before the fictional journal’s latest entry', async () => {
    const memo = (
      await createMemo(token, { content: 'A new moment in the demo.', entryDate: '2026-10-12' })
    ).memo
    const list = await listMemos(token, 200, undefined, { archived: false, favorited: false })
    expect(list.memos[0].id).toBe(memo.id)
  })
  it('boots a populated account and applies the production archive and favorite filters', async () => {
    expect(await getBootstrap()).toMatchObject({ initialized: true })
    expect((await getMe(token)).account).toMatchObject({ username: 'lin', displayName: '林序' })
    const first = await listMemos(token, 11, undefined, { archived: false, favorited: false })
    const second = await listMemos(token, 11, first.nextCursor, {
      archived: false,
      favorited: false,
    })
    expect(first.nextCursor).toBeTruthy()
    expect(new Set([...first.memos, ...second.memos].map(memo => memo.id)).size).toBe(22)
    const all = await listMemos(token, 200, undefined, { archived: false, favorited: false })
    const favorites = await listMemos(token, 200, undefined, { favorited: true, archived: false })
    expect(all.memos.length).toBeGreaterThan(80)
    expect(favorites.memos.length).toBeGreaterThan(0)
    expect(all.memos.every(memo => !memo.favoritedAt && !memo.archivedAt)).toBe(true)
    expect(favorites.memos.every(memo => memo.favoritedAt && !memo.archivedAt)).toBe(true)
    expect(favorites.memos.every(memo => !all.memos.some(value => value.id === memo.id))).toBe(true)
    expect((await listMemos(token, 200)).memos).toHaveLength(demoRecords.length)
    expect((await listAskConversations(token)).conversations.length).toBeGreaterThanOrEqual(3)
  })

  it('keeps writes versioned and applies archive, search, deletion, and restore consistently', async () => {
    let memo = (
      await createMemo(token, {
        content: 'A small museum beside the river.',
        entryDate: '2026-10-12',
      })
    ).memo
    const original = memo
    memo = (await setMemoFavorited(token, memo, true)).memo
    expect(memo.version).toBe(original.version + 1)
    await expect(updateMemo(token, original, { content: 'A stale edit' })).rejects.toMatchObject({
      status: 409,
      code: 'version_conflict',
    })
    expect((await getMemo(token, memo.id)).memo.content).toBe(original.content)
    expect(
      (
        await searchMemos(token, 'museum beside the river', 100, {
          favorited: true,
          archived: false,
        })
      ).memos.map(value => value.id),
    ).toContain(memo.id)
    memo = (await setMemoArchived(token, memo, true)).memo
    expect(
      (await searchMemos(token, 'museum beside the river', 100, { archived: false })).memos,
    ).toHaveLength(0)
    expect(
      (
        await searchMemos(token, 'museum beside the river', 100, {
          archived: true,
          favorited: true,
        })
      ).memos.map(value => value.id),
    ).toEqual([memo.id])
    memo = (await deleteMemo(token, memo)).memo
    await expect(getMemo(token, memo.id)).rejects.toMatchObject({ status: 404 })
    expect(
      (await searchMemos(token, 'museum beside the river', 100, { deleted: true })).memos.map(
        value => value.id,
      ),
    ).toEqual([memo.id])
    memo = (await restoreMemo(token, memo)).memo
    expect(memo.deletedAt).toBeNull()
    expect(memo.archivedAt).not.toBeNull()
    expect(memo.favoritedAt).not.toBeNull()
    memo = (await setMemoArchived(token, memo, false)).memo
    expect(
      (await searchMemos(token, 'museum beside the river', 100, { archived: false })).memos.map(
        value => value.id,
      ),
    ).toEqual([memo.id])
    memo = (await deleteMemo(token, memo)).memo
    const purged = (await purgeMemo(token, memo)).memo
    expect(purged.content).toBe('')
    expect(purged.purgedAt).not.toBeNull()
    expect(
      (await listMemos(token, 200, undefined, { deleted: true })).memos.some(
        value => value.id === memo.id,
      ),
    ).toBe(false)
    await expect(restoreMemo(token, purged)).rejects.toMatchObject({ status: 404 })
  })

  it('preserves browser edits across installs and resets the complete local space', async () => {
    const memo = (
      await createMemo(token, {
        content: 'An added record that survives reopening.',
        entryDate: '2026-10-12',
      })
    ).memo
    await setMemoFavorited(token, memo, true)
    const conversation = (await createAskConversation(token, { contextScope: 'all' })).conversation
    await sendQuestion(conversation.id)
    transport.restore()
    transport = installDemoTransport({ locale: 'en' })
    expect((await getMemo(token, memo.id)).memo).toMatchObject({
      content: memo.content,
      favoritedAt: expect.any(String),
    })
    expect((await listAskMessages(token, conversation.id)).messages).toHaveLength(2)
    localStorage.setItem(`sillage.entry-draft.memo:${memo.id}`, 'A draft for the added demo record')
    localStorage.setItem(`sillage.entry-draft.memo:${demoRecords[0].id}`, 'A fixture edit draft')
    localStorage.setItem('sillage.entry-draft.memo:new', 'An unsaved new record')
    localStorage.setItem('sillage.quick-capture-draft', 'A quick draft')
    localStorage.setItem('sillage.entry-draft.memo:unrelated-record', 'An unrelated draft')
    localStorage.setItem('sillage-language', 'en')
    localStorage.setItem('sillage-theme', 'dark')
    localStorage.setItem('sillage-sidebar-collapsed', 'true')
    transport.reset()
    await expect(getMemo(token, memo.id)).rejects.toMatchObject({ status: 404 })
    await expect(getAskConversation(token, conversation.id)).rejects.toMatchObject({ status: 404 })
    expect((await listMemos(token, 200)).memos).toHaveLength(demoRecords.length)
    expect((await listAskConversations(token)).conversations).toHaveLength(3)
    expect(localStorage.getItem(`sillage.entry-draft.memo:${memo.id}`)).toBeNull()
    expect(localStorage.getItem(`sillage.entry-draft.memo:${demoRecords[0].id}`)).toBeNull()
    expect(localStorage.getItem('sillage.entry-draft.memo:new')).toBeNull()
    expect(localStorage.getItem('sillage.quick-capture-draft')).toBeNull()
    expect(localStorage.getItem('sillage.entry-draft.memo:unrelated-record')).toBe(
      'An unrelated draft',
    )
    expect(localStorage.getItem('sillage-language')).toBe('en')
    expect(localStorage.getItem('sillage-theme')).toBe('dark')
    expect(localStorage.getItem('sillage-sidebar-collapsed')).toBe('true')
  })

  it('produces a source-backed preset stream, keeps the branch, and can save its answer as a record', async () => {
    const conversation = (await createAskConversation(token, { contextScope: 'all' })).conversation
    const answer = await sendQuestion(conversation.id)
    expect(answer.content).toContain('No AI service was called')
    expect(answer.sourceRefs.length).toBeGreaterThan(0)
    for (const source of answer.sourceRefs) {
      const memo = (await getMemo(token, source.memoId)).memo
      expect(memo.entryDate).toBe(source.entryDate)
      expect(memo.content.replace(/\s+/g, ' ')).toContain(source.excerpt)
    }
    expect((await getAskConversation(token, conversation.id)).conversation.headMessageId).toBe(
      answer.id,
    )
    const stored = (await listAskMessages(token, conversation.id)).messages
    expect(stored).toHaveLength(2)
    expect(answer.parentId).toBe(stored.find(message => message.role === 'user')?.id)
    const saved = (await createMemo(token, { content: answer.content, entryDate: '2026-10-12' }))
      .memo
    expect((await getMemo(token, saved.id)).memo.content).toBe(answer.content)

    let variant: AskMessage | undefined
    await streamAskMessage(
      token,
      conversation.id,
      { content: '', contextScope: 'all', forkOfId: answer.id },
      {
        onDone: message => {
          variant = message
        },
      },
    )
    expect(variant).toMatchObject({ parentId: answer.parentId, forkOfId: answer.id })
    expect((await listAskMessages(token, conversation.id)).messages).toHaveLength(3)
    await setAskHead(token, conversation.id, answer.id)
    expect((await getAskConversation(token, conversation.id)).conversation.headMessageId).toBe(
      answer.id,
    )
    await setAskConversationArchived(token, conversation.id, true)
    expect(
      (await listAskConversations(token)).conversations.some(value => value.id === conversation.id),
    ).toBe(false)
    expect(
      (await listAskConversations(token, { archived: true })).conversations.map(value => value.id),
    ).toEqual([conversation.id])
  })

  it('does not attach an invented source to an unsupported personal question', async () => {
    const conversation = (await createAskConversation(token, { contextScope: 'all' })).conversation
    const answer = await sendQuestion(conversation.id, 'What was my childhood address?')
    expect(answer.content).toContain('There is no preset answer for this question')
    expect(answer.sourceRefs).toEqual([])
    expect(
      (await listAskMessages(token, conversation.id)).messages.find(
        message => message.id === answer.id,
      )?.sourceRefs,
    ).toEqual([])
  })

  it('stops a stream and retains only the part already shown to the user', async () => {
    const conversation = (await createAskConversation(token, { contextScope: 'all' })).conversation
    const controller = new AbortController()
    let shown = ''
    const onDone = vi.fn()
    await streamAskMessage(
      token,
      conversation.id,
      { content: question, contextScope: 'all' },
      {
        onDelta: text => {
          shown += text
          controller.abort()
        },
        onDone,
      },
      controller.signal,
    )
    expect(shown.length).toBeGreaterThan(0)
    expect(onDone).not.toHaveBeenCalled()
    expect(
      (await listAskMessages(token, conversation.id)).messages.find(
        message => message.role === 'assistant',
      ),
    ).toMatchObject({ content: shown, status: 'stopped' })
  })

  it('invalidates an old summary after editing its source record', async () => {
    let memo = (
      await createMemo(token, {
        content: 'Read a few pages beside the window.',
        entryDate: '2026-10-12',
      })
    ).memo
    const summary = (await generateMemoSummary(token, memo)).ai
    expect(summary.summary).toContain('no AI service called')
    expect(JSON.parse(summary.sourceMemoIds)).toEqual([memo.id])
    expect((await getMemo(token, memo.id)).ai?.summary).toBe(summary.summary)
    memo = (await updateMemo(token, memo, { content: 'Read another chapter and made coffee.' }))
      .memo
    expect((await getMemo(token, memo.id)).ai).toBeNull()
  })

  it('explains unsupported uploads without sending a file or losing the production editor draft', async () => {
    transport.restore()
    const networkFetch = vi.fn()
    globalThis.fetch = networkFetch
    transport = installDemoTransport({ locale: 'en' })
    localStorage.setItem('sillage-language', 'en')
    const user = userEvent.setup()
    const onSubmit = vi.fn(async (input: { content: string; entryDate: string }) => {
      await createMemo(token, input)
    })
    const onUpload = async (file: File) => {
      const result = await uploadAttachment(token, file)
      return {
        url: result.attachment.url,
        filename: result.attachment.filename,
        isImage: result.attachment.contentType.startsWith('image/'),
      }
    }
    const router = createMemoryRouter([
      {
        path: '/',
        element: createElement(EntryComposer, {
          draftKey: 'memo:new',
          initialEntryDate: '2026-10-12',
          onSubmit,
          onUpload,
        }),
      },
    ])
    const { container } = render(
      createElement(I18nProvider, null, createElement(RouterProvider, { router })),
    )
    const text = 'Keep this thought even if my photo cannot be uploaded.'
    await user.type(screen.getByRole('textbox'), text)
    await user.upload(
      container.querySelector('input[type="file"]') as HTMLInputElement,
      new File(['a local photo'], 'window.jpg', { type: 'image/jpeg' }),
    )

    await screen.findAllByText(
      /Attachment uploads are available in the full app; your draft stays intact/,
    )
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe(text)
    expect(JSON.parse(localStorage.getItem('sillage.entry-draft.memo:new') ?? '{}').content).toBe(
      text,
    )
    expect(networkFetch).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ content: text, entryDate: '2026-10-12' }),
    )
    expect((await searchMemos(token, 'Keep this thought even if my photo')).memos[0]?.content).toBe(
      text,
    )
  })

  it('never forwards unknown API calls or AI credentials to a real network', async () => {
    transport.restore()
    const originalFetch = vi.fn().mockResolvedValue(new Response('static asset'))
    globalThis.fetch = originalFetch
    transport = installDemoTransport({ locale: 'en' })
    const unknown = await fetch('/api/v1/future-feature')
    expect(unknown.status).toBe(404)
    const settings = await getAISettings(token)
    expect(settings.profiles.every(profile => !profile.hasApiKey)).toBe(true)
    const response = await fetch('/api/v1/settings/ai:test', {
      method: 'POST',
      body: JSON.stringify({
        baseUrl: 'https://private-endpoint.example',
        apiKey: 'test-secret-that-must-not-be-stored',
      }),
    })
    expect(response.status).toBe(400)
    expect(await response.text()).toContain('does not connect to an AI service')
    expect(localStorage.getItem('sillage-product-demo-v1')).not.toContain(
      'test-secret-that-must-not-be-stored',
    )
    expect(
      (await fetch('https://private-endpoint.example/v1/chat/completions', { method: 'POST' }))
        .status,
    ).toBe(403)
    expect(originalFetch).not.toHaveBeenCalled()
    await fetch('/demo/walk.jpg')
    expect(originalFetch).toHaveBeenCalledOnce()
  })
})
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createElement } from 'react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
