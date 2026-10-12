export type Locale = 'en' | 'zh'

export const LINKS = {
  github: 'https://github.com/getsillage/sillage',
  releases: 'https://github.com/getsillage/sillage/releases',
  docs: 'https://github.com/getsillage/sillage/tree/main/docs',
  deployment: 'https://github.com/getsillage/sillage/blob/main/docs/user/deployment.md',
  data: 'https://github.com/getsillage/sillage/blob/main/docs/user/data.md',
  ai: 'https://github.com/getsillage/sillage/blob/main/docs/user/ai.md',
  security: 'https://github.com/getsillage/sillage/blob/main/SECURITY.md',
  contributing: 'https://github.com/getsillage/sillage/blob/main/CONTRIBUTING.md',
  brand: 'https://github.com/getsillage/.github/blob/main/BRAND.md',
  license: 'https://github.com/getsillage/sillage/blob/main/LICENSE',
} as const

type Messages = {
  metaTitle: string
  metaDescription: string
  skipToContent: string
  navAria: string
  navFeatures: string
  navPrivacy: string
  navDeploy: string
  navWeb: string
  menuOpen: string
  menuClose: string
  langLabel: string
  themeLight: string
  themeDark: string
  heroEyebrow: string
  heroTitle: string
  heroTitleSecond: string
  heroLead: string
  heroProofs: string[]
  ctaDeploy: string
  ctaGithub: string
  ctaDocs: string
  previewLabel: string
  previewCaption: string
  flowTitle: string
  flowSteps: { title: string; body: string }[]
  featuresTitle: string
  featuresLead: string
  features: { title: string; body: string }[]
  facts: { value: string; label: string }[]
  notTitle: string
  notLead: string
  notItems: string[]
  privacyTitle: string
  privacyLead: string
  privacyItems: { title: string; body: string }[]
  privacyFlowLabel: string
  privacyFlowLocalKicker: string
  privacyFlowLocalTitle: string
  privacyFlowLocalItems: string[]
  privacyFlowOptional: string
  privacyFlowProviderKicker: string
  privacyFlowProviderTitle: string
  privacyLink: string
  deployTitle: string
  deployLead: string
  deployNote: string
  deployOpen: string
  deploySteps: { title: string; body: string }[]
  deployLatest: string
  deployDocs: string
  deployReleases: string
  copyCode: string
  copied: string
  copyFailed: string
  webTitle: string
  webLead: string
  webBody: string
  webPoints: string[]
  footerTagline: string
  footerProduct: string
  footerResources: string
  footerCommunity: string
  footerGithub: string
  footerReleases: string
  footerDocs: string
  footerDeploy: string
  footerData: string
  footerAi: string
  footerSecurity: string
  footerContributing: string
  footerBrand: string
  footerLicense: string
  footerWebsiteRepository: string
  footerRights: string
  footerNoHosted: string
}

export const messages: Record<Locale, Messages> = {
  en: {
    metaTitle: 'Sillage — Self-hosted private records with grounded AI',
    metaDescription:
      'Self-hosted, single-user space for private records, history review, and AI answers grounded in your own notes.',
    skipToContent: 'Skip to content',
    navAria: 'Primary',
    navFeatures: 'Features',
    navPrivacy: 'Privacy',
    navDeploy: 'Deploy',
    navWeb: 'Web',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    langLabel: 'Language',
    themeLight: 'Switch to light theme',
    themeDark: 'Switch to dark theme',
    heroEyebrow: 'Self-hosted · Single-user · Open source',
    heroTitle: 'Your records stay with you.',
    heroTitleSecond: 'Your answers come with sources.',
    heroLead:
      'Self-hosted, single-user space for private records, history review, and AI answers grounded in your own notes.',
    heroProofs: ['No hosted Sillage account', 'Browser access', 'MIT licensed'],
    ctaDeploy: 'Quick start',
    ctaGithub: 'View on GitHub',
    ctaDocs: 'Documentation',
    previewLabel: 'Illustrated product interface preview',
    previewCaption: 'Illustrative preview — not a live screenshot',
    flowTitle: 'How it works',
    flowSteps: [
      {
        title: 'Write',
        body: 'Capture moments in Markdown with images and files. Drafts stay recoverable.',
      },
      {
        title: 'Revisit',
        body: 'Browse lists, calendar, and search. Favorites and archives keep things light.',
      },
      {
        title: 'Ask',
        body: 'Optional AI summarizes records and answers with sources when claims are personal.',
      },
    ],
    featuresTitle: 'Built for long-term private use',
    featuresLead:
      'Clear writing first. Organization stays lightweight. AI stays optional and source-aware.',
    features: [
      {
        title: 'Markdown records',
        body: 'Date plus body is enough. Short notes and longer writing share the same editor.',
      },
      {
        title: 'Lists, calendar, search',
        body: 'Find what you wrote through list views, a calendar, full-text search, favorites, and archives.',
      },
      {
        title: 'Source-grounded Ask',
        body: 'Personal claims cite your records. General questions stay general—without fake citations.',
      },
      {
        title: 'Your AI endpoint',
        body: 'Configure Anthropic-compatible or OpenAI-compatible endpoints. No built-in model. No vendor lock-in.',
      },
      {
        title: 'Responsive Web',
        body: 'Write and revisit records from desktop or mobile browsers, in English or Simplified Chinese.',
      },
      {
        title: 'Recoverable drafts',
        body: 'Recover unsaved writing in the editor and continue where you left off.',
      },
    ],
    facts: [
      { value: '1', label: 'account per instance' },
      { value: '2', label: 'interface languages' },
      { value: '0', label: 'Sillage-hosted services' },
    ],
    notTitle: 'What Sillage is not',
    notLead: 'Sillage stays focused by leaving these capabilities out.',
    notItems: [
      'Not multi-user collaboration or social publishing',
      'Not a public profile, feed, tags, or discovery surface',
      'Not a hosted SaaS—you run your own instance',
      'Not a mood tracker, diagnostic tool, or AI that directs your writing',
      'Not a full file drive or project management suite',
    ],
    privacyTitle: 'Privacy by design',
    privacyLead:
      'Your records stay in the data directory on the machine running Sillage. AI is optional and only connects to endpoints you configure.',
    privacyItems: [
      {
        title: 'Single account per instance',
        body: 'The first visit creates the only account. Everything else requires sign-in.',
      },
      {
        title: 'Instance data directory',
        body: 'SQLite, attachments, and runtime secrets stay under your data path—back up the whole directory.',
      },
      {
        title: 'Encrypted API keys',
        body: 'Provider keys are stored in encrypted envelopes and never returned by the API.',
      },
      {
        title: 'Clear AI data flow',
        body: 'Summaries and Ask send only what that operation needs. Attachment bytes are not uploaded as AI content.',
      },
    ],
    privacyFlowLabel: 'Sillage data flow',
    privacyFlowLocalKicker: 'On the machine running Sillage',
    privacyFlowLocalTitle: 'Your Sillage instance',
    privacyFlowLocalItems: ['SQLite records', 'Attachment files', 'Encrypted provider keys'],
    privacyFlowOptional: 'Only when you choose Summary or Ask',
    privacyFlowProviderKicker: 'Optional external request',
    privacyFlowProviderTitle: 'Your configured AI endpoint',
    privacyLink: 'Read AI usage and privacy',
    deployTitle: 'Run Sillage on your own machine',
    deployLead:
      'One Docker command starts Sillage. Its data stays in the configured data directory, and the service listens on localhost by default.',
    deployNote:
      'Need Compose, HTTPS, or a pinned image? See the deployment guide. Public ingress, TLS, DNS, tunnels, and CDNs are yours to operate.',
    deployOpen: 'Then open http://localhost:5231 and create the only account.',
    deploySteps: [
      { title: 'Run', body: 'Start the published container on localhost.' },
      { title: 'Create', body: 'Open the app and create the instance’s only account.' },
      { title: 'Keep', body: 'Back up the complete data directory before upgrades.' },
    ],
    deployLatest: 'Latest release',
    deployDocs: 'Full deployment guide',
    deployReleases: 'GitHub Releases',
    copyCode: 'Copy',
    copied: 'Copied',
    copyFailed: 'Copy failed',
    webTitle: 'Web interface',
    webLead: 'One instance, accessible from desktop and mobile browsers.',
    webBody:
      'Open your Sillage instance to write, revisit records, and use Ask. Choose light or dark themes and English or Simplified Chinese.',
    webPoints: ['No client installation required', 'Responsive desktop and mobile interface', 'The same records on your instance'],
    footerTagline: 'Self-hosted private records.',
    footerProduct: 'Product',
    footerResources: 'Resources',
    footerCommunity: 'Community',
    footerGithub: 'GitHub',
    footerReleases: 'Releases',
    footerDocs: 'Documentation',
    footerDeploy: 'Deployment',
    footerData: 'Data & backup',
    footerAi: 'AI & privacy',
    footerSecurity: 'Security policy',
    footerContributing: 'Contributing',
    footerBrand: 'Brand guide',
    footerLicense: 'MIT License',
    footerWebsiteRepository: 'Website repository',
    footerRights: 'Open source under the MIT License.',
    footerNoHosted: 'No official hosted service.',
  },
  zh: {
    metaTitle: 'Sillage — 自托管的私密记录空间',
    metaDescription:
      '自托管的单人记录空间：保存日常记录、回看历史，并基于自己的记录进行 AI 总结与问答。',
    skipToContent: '跳到正文',
    navAria: '主导航',
    navFeatures: '能力',
    navPrivacy: '隐私',
    navDeploy: '部署',
    navWeb: '浏览器访问',
    menuOpen: '打开菜单',
    menuClose: '关闭菜单',
    langLabel: '语言',
    themeLight: '切换到浅色主题',
    themeDark: '切换到深色主题',
    heroEyebrow: '自托管 · 单人 · 开源',
    heroTitle: '记录由你自己保管。',
    heroTitleSecond: '答案带着来源。',
    heroLead:
      '自托管的单人记录空间：保存日常记录、回看历史，并基于自己的记录进行 AI 总结与问答。',
    heroProofs: ['无需 Sillage 托管账号', '浏览器访问', 'MIT 开源'],
    ctaDeploy: '快速开始',
    ctaGithub: '查看 GitHub',
    ctaDocs: '文档',
    previewLabel: '产品界面示意预览',
    previewCaption: '界面示意，非真实截图',
    flowTitle: '如何使用',
    flowSteps: [
      {
        title: '写记录',
        body: '用 Markdown 写下片段，可附图片与文件；未提交草稿可恢复。',
      },
      {
        title: '回看',
        body: '列表、日历与搜索；收藏和归档保持轻量整理。',
      },
      {
        title: '问答',
        body: '可选 AI 总结记录；涉及个人历史的结论会引用记录来源。',
      },
    ],
    featuresTitle: '为长期私密使用而设计',
    featuresLead: '写作优先，整理保持轻量；AI 可选，个人结论有来源。',
    features: [
      {
        title: 'Markdown 记录',
        body: '日期与正文即可。短记与长文共用同一编辑器。',
      },
      {
        title: '列表、日历、搜索',
        body: '通过列表、日历、全文搜索、收藏与归档找回写下的内容。',
      },
      {
        title: '有来源的问答',
        body: '关于个人生活的论断需引用记录；一般问题可自然作答，不伪造来源。',
      },
      {
        title: '自配 AI 端点',
        body: '配置兼容 Anthropic 或 OpenAI 协议的端点。无内置模型，无厂商绑定。',
      },
      {
        title: '响应式 Web',
        body: '通过桌面或手机浏览器写记录、回看历史，支持简体中文与英文。',
      },
      {
        title: '草稿恢复',
        body: '恢复编辑器中的未提交草稿，接着写下去。',
      },
    ],
    facts: [
      { value: '1', label: '个账号 / 每个实例' },
      { value: '2', label: '种界面语言' },
      { value: '0', label: '项由 Sillage 提供的托管服务' },
    ],
    notTitle: 'Sillage 不是什么',
    notLead: 'Sillage 保持专注，因此不包含以下能力。',
    notItems: [
      '不是多人协作或社交发布平台',
      '不是公开主页、动态流、标签或发现系统',
      '不是官方托管 SaaS——由你自己运行实例',
      '不是情绪追踪、诊断工具，或替你主导表达的 AI',
      '不是完整网盘或项目管理套件',
    ],
    privacyTitle: '隐私优先',
    privacyLead: '记录保存在运行 Sillage 的机器和数据目录中。AI 可选，且只连接你配置的端点。',
    privacyItems: [
      {
        title: '每实例唯一账号',
        body: '首次打开创建唯一账号。之后访问记录、附件、总结与问答均需登录。',
      },
      {
        title: '实例数据目录',
        body: 'SQLite、附件与运行时密钥位于你的数据路径——备份请复制整个目录。',
      },
      {
        title: '加密的 API 密钥',
        body: '服务商密钥以加密信封存储，接口从不返回明文。',
      },
      {
        title: '清晰的 AI 数据流',
        body: '总结与问答只发送该操作所需内容。附件字节不会作为 AI 内容上传。',
      },
    ],
    privacyFlowLabel: 'Sillage 数据流',
    privacyFlowLocalKicker: '保存在运行 Sillage 的机器',
    privacyFlowLocalTitle: '你的 Sillage 实例',
    privacyFlowLocalItems: ['SQLite 记录', '附件文件', '加密的服务商密钥'],
    privacyFlowOptional: '仅在你主动使用总结或问答时',
    privacyFlowProviderKicker: '可选的外部请求',
    privacyFlowProviderTitle: '你配置的 AI 端点',
    privacyLink: '阅读 AI 使用与隐私',
    deployTitle: '在自己的机器上运行 Sillage',
    deployLead: '一条 Docker 命令即可启动。数据保存在配置的数据目录中，服务默认只监听 localhost。',
    deployNote: '需要 Compose、HTTPS 或固定某一镜像时，见部署说明。公网入口、TLS、DNS、隧道与 CDN 由你自行管理。',
    deployOpen: '然后打开 http://localhost:5231，按提示创建唯一账号。',
    deploySteps: [
      { title: '运行', body: '在 localhost 启动已发布的容器镜像。' },
      { title: '创建', body: '打开应用并创建这个实例的唯一账号。' },
      { title: '保管', body: '升级前备份完整数据目录。' },
    ],
    deployLatest: '最新版本',
    deployDocs: '完整部署说明',
    deployReleases: 'GitHub Releases',
    copyCode: '复制',
    copied: '已复制',
    copyFailed: '复制失败',
    webTitle: '浏览器访问',
    webLead: '一个实例，桌面与手机浏览器都能访问。',
    webBody: '打开你的 Sillage 实例，即可写记录、回看历史和使用问答。可选择浅色或深色主题，以及简体中文或英文。',
    webPoints: ['无需安装客户端', '响应式界面适配桌面与手机', '访问同一实例中的记录'],
    footerTagline: '自托管的私密记录空间。',
    footerProduct: '产品',
    footerResources: '资源',
    footerCommunity: '社区',
    footerGithub: 'GitHub',
    footerReleases: '版本发布',
    footerDocs: '文档',
    footerDeploy: '部署',
    footerData: '数据与备份',
    footerAi: 'AI 与隐私',
    footerSecurity: '安全策略',
    footerContributing: '贡献指南',
    footerBrand: '品牌规范',
    footerLicense: 'MIT 许可证',
    footerWebsiteRepository: '官网源码仓库',
    footerRights: '以 MIT 许可证开源。',
    footerNoHosted: '无官方托管服务。',
  },
}
