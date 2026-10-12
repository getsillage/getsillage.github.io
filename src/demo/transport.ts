import { demoAsOf, demoRecords } from './data'
import { assetUrl } from '../lib/assets'
import type {
  Account,
  AISettings,
  AskContextScope,
  AskConversation,
  AskMessage,
  AskMessageInput,
  AskSourceRef,
  Memo,
  MemoAI,
} from './product/lib/api'

type Locale = 'zh-CN' | 'en'
type DemoState = {
  memos: Memo[]
  summaries: Record<string, MemoAI>
  conversations: AskConversation[]
  messages: AskMessage[]
  autoSummary: boolean
}

const STORAGE_KEY = 'sillage-product-demo-v1'
const demoToken = 'sillage-local-demo-token'
const presetQuestions = [
  '最近我反复提到什么？',
  '这一周有哪些重要内容？',
  '最近的记录里，哪些主题出现了变化？',
  '最近，有哪些反复出现的主题？',
  '帮我回顾一下最近的生活',
  'What have I mentioned repeatedly lately?',
  'What stood out this week?',
  'Which themes changed across my recent records?',
  'What themes keep appearing in my recent records?',
  'Help me look back on life lately',
]

function timestamp() {
  return new Date().toISOString()
}
function identifier(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}
function normalizedQuestion(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[?？。.!！]+$/u, '')
}
function validDate(date: unknown): date is string {
  return (
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date
  )
}
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
function error(status: number, code: string, message: string) {
  return json({ error: { code, message } }, status)
}

function account(): Account {
  return {
    id: 'demo-account',
    username: 'lin',
    displayName: '林序',
    createdAt: '2024-06-01T08:00:00+08:00',
    updatedAt: '2026-10-12T08:00:00+08:00',
  }
}

function summarize(memo: Memo, locale: Locale): MemoAI {
  const now = timestamp()
  return {
    memoId: memo.id,
    summary: `${locale === 'zh-CN' ? '示例总结（未调用 AI）' : 'Example summary (no AI service called)'}\n\n${memo.content.split('\n').filter(Boolean)[0]?.slice(0, 240) ?? ''}`,
    sentiment: null,
    provider: 'demo',
    model: 'local-preset',
    profileId: 'demo-profile',
    promptVersion: 'demo-v1',
    sourceMemoIds: JSON.stringify([memo.id]),
    status: 'complete',
    errorCode: null,
    startedAt: now,
    finishedAt: now,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function answerFor(question: string, memos: Memo[], scope: AskContextScope, locale: Locale) {
  const zh = locale === 'zh-CN'
  const disclosure = zh
    ? '这是预设示例回答，未调用 AI 服务。'
    : 'This is a preset example answer. No AI service was called.'
  if (!presetQuestions.some(value => normalizedQuestion(value) === normalizedQuestion(question))) {
    return {
      content: `${disclosure}\n\n${zh ? '这个问题没有预设回答。可以试试页面上的示例问题，查看回答如何关联来源记录。' : 'There is no preset answer for this question. Try a suggested question to see how an answer connects to source records.'}`,
      sourceRefs: [] as AskSourceRef[],
    }
  }
  let available = memos.filter(memo => !memo.deletedAt && !memo.purgedAt)
  if (scope !== 'all') {
    const latestDay = available.reduce(
      (latest, memo) => (memo.entryDate > latest ? memo.entryDate : latest),
      demoAsOf,
    )
    const start = new Date(`${latestDay}T12:00:00Z`)
    start.setUTCDate(start.getUTCDate() - (scope === 'recent_7_days' ? 6 : 29))
    available = available.filter(memo => memo.entryDate >= start.toISOString().slice(0, 10))
  }
  available.sort(
    (a, b) => b.entryDate.localeCompare(a.entryDate) || b.createdAt.localeCompare(a.createdAt),
  )
  const words = zh
    ? ['散步', '设计', '咖啡', '读', '绿萝']
    : ['walk', 'design', 'coffee', 'read', 'plant']
  const chosen: Memo[] = []
  for (const word of words) {
    const match = available.find(
      memo =>
        !chosen.some(value => value.id === memo.id) && memo.content.toLowerCase().includes(word),
    )
    if (match) chosen.push(match)
    if (chosen.length === 3) break
  }
  if (!chosen.length) chosen.push(...available.slice(0, 3))
  const sourceRefs = chosen.map((memo, index) => ({
    memoId: memo.id,
    entryDate: memo.entryDate,
    excerpt: memo.content.replace(/\s+/g, ' ').slice(0, 180),
    rank: index + 1,
  }))
  const content = sourceRefs.length
    ? `${disclosure}\n\n${zh ? '这些记录留下了一些值得回看的片段：' : 'These records contain a few moments worth revisiting:'}\n\n${sourceRefs.map(source => `- **${source.entryDate}**：${source.excerpt}`).join('\n\n')}\n\n${zh ? '下面的来源可以打开对应的原始记录。' : 'Open the sources below to revisit the original records.'}`
    : `${disclosure}\n\n${zh ? '当前范围的记录不足以支持回答。' : 'There are not enough records in the selected scope to support an answer.'}`
  return { content, sourceRefs }
}

function initialState(locale: Locale): DemoState {
  const archivedIds = new Set(['memo-007', 'memo-021', 'memo-038'])
  const memos: Memo[] = demoRecords.map(record => ({
    id: record.id,
    content: `${record[locale === 'zh-CN' ? 'zh' : 'en']}${record.image ? `\n\n![${locale === 'zh-CN' ? '记录中的照片' : 'A photo from this record'}](${assetUrl(`demo/${record.image}.jpg`)})` : ''}`,
    entryDate: record.createdAt.slice(0, 10),
    version: 1,
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.createdAt).toISOString(),
    favoritedAt: record.pinned ? record.createdAt : null,
    archivedAt: archivedIds.has(record.id) ? record.createdAt : null,
    deletedAt: null,
    purgedAt: null,
  }))
  const summaries = Object.fromEntries(
    memos.filter(memo => memo.favoritedAt).map(memo => [memo.id, summarize(memo, locale)]),
  )
  const conversations: AskConversation[] = []
  const messages: AskMessage[] = []
  const questions = locale === 'zh-CN' ? presetQuestions.slice(0, 3) : presetQuestions.slice(5, 8)
  questions.forEach((question, index) => {
    const id = `demo-conversation-${index + 1}`
    const createdAt = `2026-10-${String(12 - index).padStart(2, '0')}T19:00:00+08:00`
    const userId = `${id}-question`
    const answerId = `${id}-answer`
    conversations.push({
      id,
      title: question,
      status: 'active',
      contextScope: 'recent_30_days',
      headMessageId: answerId,
      pinnedAt: null,
      archivedAt: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    })
    const base = {
      conversationId: id,
      forkOfId: null,
      status: 'complete',
      model: 'local-preset',
      promptVersion: 'demo-v1',
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    }
    messages.push({
      ...base,
      id: userId,
      role: 'user',
      content: question,
      parentId: null,
      sourceRefs: [],
    })
    messages.push({
      ...base,
      id: answerId,
      role: 'assistant',
      ...answerFor(question, memos, 'recent_30_days', locale),
      parentId: userId,
    })
  })
  return { memos, summaries, conversations, messages, autoSummary: false }
}

function readState(locale: Locale): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as DemoState | null
    if (
      saved &&
      Array.isArray(saved.memos) &&
      Array.isArray(saved.conversations) &&
      Array.isArray(saved.messages) &&
      saved.summaries &&
      saved.memos.every(
        memo =>
          typeof memo.id === 'string' &&
          typeof memo.content === 'string' &&
          validDate(memo.entryDate) &&
          Number.isInteger(memo.version),
      )
    ) {
      return {
        ...saved,
        memos: saved.memos.map(memo => ({
          ...memo,
          createdAt: new Date(memo.createdAt).toISOString(),
          updatedAt: new Date(memo.updatedAt).toISOString(),
        })),
      }
    }
  } catch {
    /* Start from the fixture if local storage is unavailable or stale. */
  }
  return initialState(locale)
}

export function installDemoTransport({ locale }: { locale: Locale }): {
  reset(): void
  restore(): void
} {
  const originalFetch = globalThis.fetch
  let state = readState(locale)
  let signedIn = true
  const zh = locale === 'zh-CN'
  const unsupported = () =>
    error(
      400,
      'demo_unsupported',
      zh
        ? '体验页使用本地预设，不连接外部 AI，也不修改真实账号。'
        : 'The demo uses local presets. It does not connect to an AI service or change a real account.',
    )
  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* The current in-memory session remains usable. */
    }
  }
  const authResponse = () => ({
    account: account(),
    accessToken: demoToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
  const settings = (): AISettings => ({
    autoSummary: state.autoSummary,
    profiles: [
      {
        id: 'demo-profile',
        name: zh ? '本地示例（未调用 AI）' : 'Local demo (no AI service)',
        provider: 'openai',
        baseUrl: 'https://example.invalid',
        model: 'local-preset',
        temperature: 0,
        maxTokens: 1024,
        enabled: false,
        active: true,
        hasApiKey: false,
        keyUnavailable: false,
        autoSummary: false,
        createdAt: '2026-06-01T08:00:00Z',
        updatedAt: '2026-06-01T08:00:00Z',
      },
    ],
  })
  persist()

  async function dispatch(
    url: URL,
    method: string,
    body: Record<string, unknown> | FormData,
    signal?: AbortSignal | null,
  ): Promise<Response> {
    if (signal?.aborted) throw new DOMException('The request was aborted.', 'AbortError')
    const path = decodeURIComponent(url.pathname)
    const input = body instanceof FormData ? {} : body
    if (path === '/api/v1/auth/bootstrap' && method === 'GET')
      return json({
        initialized: true,
        serverVersion: 'demo',
        serverRevision: 'local',
        apiVersion: 'v1',
      })
    if (path === '/api/v1/auth/me' && method === 'GET')
      return signedIn
        ? json({ account: account() })
        : error(401, 'unauthenticated', zh ? '请登录体验账号。' : 'Sign in to the demo account.')
    if ((path === '/api/v1/auth/refresh' || path === '/api/v1/auth/signin') && method === 'POST') {
      if (path.endsWith('/refresh') && !signedIn)
        return error(401, 'unauthenticated', 'Demo session signed out')
      signedIn = true
      return json(authResponse())
    }
    if (path === '/api/v1/auth/signout' && method === 'POST') {
      signedIn = false
      return new Response(null, { status: 204 })
    }
    if (path === '/api/v1/auth/change-password' || path === '/api/v1/auth/initialize')
      return unsupported()

    if (path === '/api/v1/memos' && method === 'GET') {
      const params = url.searchParams
      const deleted = params.get('deleted') === 'true'
      let memos = state.memos.filter(memo => !memo.purgedAt && Boolean(memo.deletedAt) === deleted)
      if (params.has('archived'))
        memos = memos.filter(
          memo => Boolean(memo.archivedAt) === (params.get('archived') === 'true'),
        )
      if (params.has('favorited'))
        memos = memos.filter(
          memo => Boolean(memo.favoritedAt) === (params.get('favorited') === 'true'),
        )
      const query = params.get('query')?.trim().toLowerCase()
      if (query)
        memos = memos.filter(memo =>
          `${memo.content}\n${state.summaries[memo.id]?.summary ?? ''}`
            .toLowerCase()
            .includes(query),
        )
      memos.sort(
        (a, b) =>
          (deleted
            ? (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '')
            : b.entryDate.localeCompare(a.entryDate)) ||
          b.createdAt.localeCompare(a.createdAt) ||
          b.id.localeCompare(a.id),
      )
      const cursor = params.get('cursor')
      if (cursor && !/^demo:\d+$/.test(cursor))
        return error(400, 'invalid_cursor', 'Invalid demo cursor')
      const offset = cursor ? Number(cursor.slice(5)) : 0
      const limit = Math.max(1, Math.min(200, Number(params.get('limit')) || 200))
      return json({
        memos: memos.slice(offset, offset + limit),
        ...(offset + limit < memos.length ? { nextCursor: `demo:${offset + limit}` } : {}),
      })
    }
    if (path === '/api/v1/memos' && method === 'POST') {
      if (typeof input.content !== 'string' || !input.content.trim() || !validDate(input.entryDate))
        return error(
          400,
          'invalid_field',
          zh ? '请填写记录内容和有效日期。' : 'Enter record content and a valid date.',
        )
      // The fictional journal already has entries later today. New captures
      // follow its latest timestamp so the actual product lists them first.
      const latest = state.memos.reduce(
        (value, memo) => Math.max(value, Date.parse(memo.createdAt) || 0),
        0,
      )
      const now = new Date(Math.max(Date.now(), latest + 1000)).toISOString()
      const memo: Memo = {
        id: identifier('local-memo'),
        content: input.content,
        entryDate: input.entryDate,
        version: 1,
        favoritedAt: null,
        archivedAt: null,
        deletedAt: null,
        purgedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      state.memos.push(memo)
      if (state.autoSummary) state.summaries[memo.id] = summarize(memo, locale)
      persist()
      return json({ memo }, 201)
    }
    const memoRoute = path.match(/^\/api\/v1\/memos\/([^/:]+)(?::(.+))?$/)
    if (memoRoute) {
      const [, id, action] = memoRoute
      const memo = state.memos.find(value => value.id === id)
      if (!memo || memo.purgedAt || (method === 'GET' && memo.deletedAt))
        return error(404, 'not_found', zh ? '记录不存在。' : 'Record not found.')
      if (method === 'GET' && !action) return json({ memo, ai: state.summaries[id] ?? null })
      if (method === 'POST' && action === 'generate-summary') {
        if (memo.deletedAt) return error(404, 'not_found', 'Record not found')
        state.summaries[id] = summarize(memo, locale)
        persist()
        return json({ ai: state.summaries[id] })
      }
      const supported =
        (method === 'PATCH' && !action) ||
        (method === 'DELETE' && !action) ||
        (method === 'POST' &&
          ['setFavorited', 'setArchived', 'restore', 'purge'].includes(action ?? ''))
      if (!supported) return error(404, 'not_found', 'Unknown demo operation')
      const expectedVersion =
        method === 'DELETE'
          ? Number(url.searchParams.get('expectedVersion'))
          : input.expectedVersion
      if (expectedVersion !== memo.version)
        return error(
          409,
          'version_conflict',
          zh ? '记录已更新，请重新打开后再试。' : 'The record changed. Open it again and retry.',
        )
      if (memo.deletedAt && action !== 'restore' && action !== 'purge')
        return error(404, 'not_found', 'Record not found')
      if ((action === 'restore' || action === 'purge') && !memo.deletedAt)
        return error(400, 'invalid_state', 'Only deleted records can be restored or purged')
      const now = timestamp()
      if (method === 'PATCH') {
        if (
          input.content !== undefined &&
          (typeof input.content !== 'string' || !input.content.trim())
        )
          return error(400, 'invalid_field', 'Record content is required')
        if (input.entryDate !== undefined && !validDate(input.entryDate))
          return error(400, 'invalid_field', 'A valid record date is required')
        if (typeof input.content === 'string') {
          memo.content = input.content
          delete state.summaries[id]
        }
        if (typeof input.entryDate === 'string') memo.entryDate = input.entryDate
      } else if (method === 'DELETE') {
        memo.deletedAt = now
        delete state.summaries[id]
      } else if (action === 'setFavorited') {
        if (typeof input.favorited !== 'boolean')
          return error(400, 'invalid_field', 'favorited must be a boolean')
        memo.favoritedAt = input.favorited ? now : null
      } else if (action === 'setArchived') {
        if (typeof input.archived !== 'boolean')
          return error(400, 'invalid_field', 'archived must be a boolean')
        memo.archivedAt = input.archived ? now : null
      } else if (action === 'restore') memo.deletedAt = null
      else if (action === 'purge') {
        memo.content = ''
        memo.entryDate = '1970-01-01'
        memo.favoritedAt = null
        memo.archivedAt = null
        memo.purgedAt = now
        delete state.summaries[id]
        state.messages = state.messages.map(message =>
          message.sourceRefs.some(source => source.memoId === id)
            ? { ...message, content: '', sourceRefs: [], deletedAt: now, updatedAt: now }
            : message,
        )
      }
      memo.version += 1
      memo.updatedAt = now
      persist()
      return json({ memo })
    }

    if (path === '/api/v1/attachments' && method === 'POST') {
      return error(
        400,
        'demo_unsupported',
        zh
          ? '体验页可以查看样例照片，暂不支持上传附件。正式版支持附件上传；你的草稿会保留。'
          : 'You can view sample photos in the demo. Attachment uploads are available in the full app; your draft stays intact.',
      )
    }

    if (path === '/api/v1/settings/ai' && method === 'GET') return json(settings())
    if (path === '/api/v1/settings/ai:setAutoSummary' && method === 'POST') {
      if (typeof input.autoSummary !== 'boolean')
        return error(400, 'invalid_field', 'autoSummary must be a boolean')
      state.autoSummary = input.autoSummary
      persist()
      return json({ autoSummary: state.autoSummary })
    }
    if (path === '/api/v1/settings/ai:models' && method === 'POST')
      return json({ models: ['local-preset'] })
    if (path.startsWith('/api/v1/settings/ai')) return unsupported()

    if (path === '/api/v1/ask/conversations' && method === 'GET') {
      const archived = url.searchParams.get('archived') === 'true'
      const query = url.searchParams.get('query')?.trim().toLowerCase()
      const conversations = state.conversations
        .filter(
          value =>
            !value.deletedAt &&
            Boolean(value.archivedAt) === archived &&
            (!query || value.title.toLowerCase().includes(query)),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      return json({
        conversations: conversations.slice(
          0,
          Math.max(1, Math.min(50, Number(url.searchParams.get('limit')) || 50)),
        ),
      })
    }
    if (path === '/api/v1/ask/conversations' && method === 'POST') {
      const now = timestamp()
      const contextScope = ['recent_7_days', 'recent_30_days', 'all'].includes(
        String(input.contextScope),
      )
        ? (input.contextScope as AskContextScope)
        : 'recent_30_days'
      const conversation: AskConversation = {
        id: identifier('local-conversation'),
        title:
          typeof input.title === 'string' && input.title.trim()
            ? input.title
            : zh
              ? '新的问答'
              : 'New conversation',
        status: 'active',
        contextScope,
        headMessageId: null,
        pinnedAt: null,
        archivedAt: null,
        deletedAt: null,
        createdAt: now,
        updatedAt: now,
      }
      state.conversations.push(conversation)
      persist()
      return json({ conversation }, 201)
    }
    const conversationRoute = path.match(
      /^\/api\/v1\/ask\/conversations\/([^/:]+)(?::(.+)|\/(.+))?$/,
    )
    if (conversationRoute) {
      const [, id, action, child] = conversationRoute
      const conversation = state.conversations.find(value => value.id === id && !value.deletedAt)
      if (!conversation) return error(404, 'not_found', 'Conversation not found')
      if (method === 'GET' && !action && !child) return json({ conversation })
      if (method === 'POST' && action === 'setArchived') {
        if (typeof input.archived !== 'boolean')
          return error(400, 'invalid_field', 'archived must be a boolean')
        conversation.archivedAt = input.archived ? timestamp() : null
        conversation.updatedAt = timestamp()
        persist()
        return json({ conversation })
      }
      if (method === 'GET' && child === 'messages')
        return json({
          messages: state.messages.filter(
            message => message.conversationId === id && !message.deletedAt,
          ),
        })
      if (method === 'POST' && child === 'head') {
        if (
          !state.messages.some(
            message =>
              message.id === input.messageId && message.conversationId === id && !message.deletedAt,
          )
        )
          return error(404, 'not_found', 'Message not found')
        conversation.headMessageId = input.messageId as string
        conversation.updatedAt = timestamp()
        persist()
        return new Response(null, { status: 204 })
      }
      if (method === 'POST' && (child === 'messages' || child === 'messages:stream')) {
        const turn = input as unknown as AskMessageInput
        const fork =
          typeof turn.forkOfId === 'string'
            ? state.messages.find(
                message =>
                  message.id === turn.forkOfId &&
                  message.conversationId === id &&
                  message.role === 'assistant',
              )
            : undefined
        if (turn.forkOfId && !fork) return error(404, 'not_found', 'Answer not found')
        if (!fork && (typeof turn.content !== 'string' || !turn.content.trim()))
          return error(400, 'invalid_field', 'A question is required')
        const now = timestamp()
        const base = {
          conversationId: id,
          status: 'complete',
          model: 'local-preset',
          promptVersion: 'demo-v1',
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        }
        const userMessage: AskMessage = fork
          ? (state.messages.find(message => message.id === fork.parentId) as AskMessage)
          : {
              ...base,
              id: identifier('local-question'),
              role: 'user',
              content: turn.content.trim(),
              parentId: turn.parentId ?? conversation.headMessageId,
              forkOfId: null,
              sourceRefs: [],
            }
        if (!userMessage) return error(404, 'not_found', 'Question not found')
        if (!fork) state.messages.push(userMessage)
        conversation.contextScope = ['recent_7_days', 'recent_30_days', 'all'].includes(
          String(turn.contextScope),
        )
          ? turn.contextScope
          : conversation.contextScope
        const answer = answerFor(
          userMessage.content,
          state.memos,
          conversation.contextScope,
          locale,
        )
        const assistant: AskMessage = {
          ...base,
          id: identifier('local-answer'),
          role: 'assistant',
          content: child === 'messages' ? answer.content : '',
          parentId: userMessage.id,
          forkOfId: fork?.id ?? null,
          sourceRefs: answer.sourceRefs,
        }
        state.messages.push(assistant)
        conversation.headMessageId = assistant.id
        conversation.updatedAt = now
        if (
          !fork &&
          state.messages.filter(message => message.conversationId === id && message.role === 'user')
            .length === 1
        )
          conversation.title = userMessage.content.slice(0, 80)
        persist()
        if (child === 'messages') return json({ messages: [userMessage, assistant] }, 201)
        return streamResponse(
          userMessage,
          assistant,
          answer.content,
          Boolean(fork),
          signal,
          persist,
        )
      }
    }
    return error(
      404,
      'not_found',
      zh ? '体验页没有此本地接口。' : 'This endpoint is not available in the local demo.',
    )
  }

  const demoFetch: typeof fetch = async (request, init = {}) => {
    const target = request instanceof Request ? request.url : String(request)
    const url = new URL(target, window.location.origin)
    const method = (
      init.method ?? (request instanceof Request ? request.method : 'GET')
    ).toUpperCase()
    if (!url.pathname.startsWith('/api/v1')) {
      const staticResource =
        /\.(?:png|jpe?g|webp|gif|avif|svg|ico|css|js|woff2?|ttf|webmanifest)$/i.test(url.pathname)
      if (
        staticResource &&
        url.origin === window.location.origin &&
        (method === 'GET' || method === 'HEAD')
      )
        return originalFetch(request, init)
      return error(
        403,
        'demo_network_disabled',
        zh ? '体验页不会发送外部请求。' : 'External requests are disabled in the demo.',
      )
    }
    try {
      let body: Record<string, unknown> | FormData = {}
      if (init.body instanceof FormData) body = init.body
      else if (typeof init.body === 'string' && init.body)
        body = JSON.parse(init.body) as Record<string, unknown>
      else if (request instanceof Request && !['GET', 'HEAD'].includes(method))
        body = (await request.clone().json()) as Record<string, unknown>
      if (!body || typeof body !== 'object' || Array.isArray(body))
        return error(400, 'invalid_field', 'A JSON object is required')
      return await dispatch(
        url,
        method,
        body,
        init.signal ?? (request instanceof Request ? request.signal : undefined),
      )
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
      return error(
        400,
        'invalid_field',
        zh ? '无法读取体验请求。' : 'The demo request could not be read.',
      )
    }
  }
  globalThis.fetch = demoFetch
  return {
    reset() {
      try {
        for (const memo of state.memos)
          localStorage.removeItem(`sillage.entry-draft.memo:${memo.id}`)
        localStorage.removeItem('sillage.entry-draft.memo:new')
        localStorage.removeItem('sillage.quick-capture-draft')
      } catch {
        /* Reset the in-memory fixture even if storage is unavailable. */
      }
      state = initialState(locale)
      signedIn = true
      persist()
    },
    restore() {
      if (globalThis.fetch === demoFetch) globalThis.fetch = originalFetch
    },
  }
}

function streamResponse(
  userMessage: AskMessage,
  assistant: AskMessage,
  content: string,
  regenerate: boolean,
  signal: AbortSignal | null | undefined,
  persist: () => void,
): Response {
  const encoder = new TextEncoder()
  const chunks = content.match(/[\s\S]{1,100}/gu) ?? []
  let timer: ReturnType<typeof setTimeout> | undefined
  let closed = false
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      const stop = () => {
        if (closed) return
        closed = true
        clearTimeout(timer)
        assistant.status = 'stopped'
        assistant.updatedAt = timestamp()
        persist()
        signal?.removeEventListener('abort', stop)
        controller.error(new DOMException('The request was aborted.', 'AbortError'))
      }
      signal?.addEventListener('abort', stop, { once: true })
      send('start', { userMessage, sources: assistant.sourceRefs, regenerate })
      let index = 0
      const next = () => {
        if (closed) return
        if (index < chunks.length) {
          const text = chunks[index++]
          assistant.content += text
          send('delta', { text })
          persist()
          timer = setTimeout(next, 12)
        } else {
          assistant.status = 'complete'
          assistant.updatedAt = timestamp()
          persist()
          send('done', { message: assistant })
          closed = true
          signal?.removeEventListener('abort', stop)
          controller.close()
        }
      }
      next()
    },
    cancel() {
      closed = true
      clearTimeout(timer)
      assistant.status = 'stopped'
      persist()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
