import { defineConfig } from 'vitepress'

const base = process.env.DOCS_BASE ?? '/z-paging-wevu/'

export default defineConfig({
  lang: 'zh-CN',
  title: 'z-paging-wevu',
  description: '面向 weapp-vite + wevu 的 z-paging 兼容分页组件',
  base,
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
  },
  head: [
    ['link', { rel: 'icon', href: `${base}logo.svg`, type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#176b52' }],
    ['meta', { name: 'keywords', content: 'z-paging,wevu,weapp-vite,微信小程序,分页,虚拟列表' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'z-paging-wevu',
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/LittleTurtle2333/z-paging-wevu',
        ariaLabel: 'GitHub 仓库',
      },
    ],
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '^/guide/' },
      { text: '功能', link: '/advanced/virtual-list', activeMatch: '^/advanced/' },
      { text: 'API', link: '/api/props', activeMatch: '^/api/' },
      { text: '原 z-paging 项目', link: 'https://github.com/SmileZXLee/uni-z-paging' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装与快速开始', link: '/guide/getting-started' },
            { text: '示例 Demo', link: '/guide/demo' },
            { text: '滚动与布局模式', link: '/guide/scroll-modes' },
            { text: '从 z-paging 迁移', link: '/guide/migration' },
            { text: '常见问题', link: '/guide/faq' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: '列表与数据',
          items: [
            { text: '虚拟列表', link: '/advanced/virtual-list' },
            { text: '聊天记录模式', link: '/advanced/chat-record' },
            { text: '本地分页', link: '/advanced/local-paging' },
            { text: '缓存', link: '/advanced/cache' },
          ],
        },
        {
          text: '交互与展示',
          items: [
            { text: '自定义下拉刷新与二楼', link: '/advanced/custom-refresher' },
            { text: '空态与返回顶部', link: '/advanced/empty-back-to-top' },
            { text: '顶部、底部与左右布局', link: '/advanced/layout' },
            { text: '国际化文本', link: '/advanced/i18n' },
          ],
        },
      ],
      '/api/': [
        {
          text: '组件 API',
          items: [
            { text: 'Props', link: '/api/props' },
            { text: 'Methods', link: '/api/methods' },
            { text: 'Events', link: '/api/events' },
            { text: 'Slots', link: '/api/slots' },
            { text: '公用子组件', link: '/api/sub-components' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdatedText: '最近更新',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    footer: {
      message: '基于 MIT 许可发布 · z-paging 的 wevu 独立兼容实现',
      copyright: 'Copyright © 2026 littleturtle2333 · 原 z-paging Copyright © 2021 zxlee',
    },
  },
})
