---
layout: home
title: z-paging-wevu
titleTemplate: wevu 分页组件

hero:
  name: z-paging-wevu
  text: 熟悉的分页体验，适配新的 wevu 运行时
  tagline: 面向 weapp-vite + wevu 的 z-paging 独立兼容实现，覆盖刷新、加载更多、虚拟列表、聊天、本地分页与缓存。
  image:
    src: /logo.svg
    alt: z-paging-wevu
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 示例 Demo
      link: /guide/demo
    - theme: alt
      text: 查看组件 API
      link: /api/props
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/LittleTurtle2333/z-paging-wevu

features:
  - icon:
      src: /icons/refresh.svg
      alt: 分页刷新
    title: 完整分页闭环
    details: 自动维护页码和加载状态，通过 complete 系列方法提交结果，支持请求失败与无更多数据。
  - icon:
      src: /icons/virtual.svg
      alt: 虚拟列表
    title: 长列表渲染
    details: 固定与动态高度虚拟列表，明确适配微信端的 virtual-list-change 渲染路径。
  - icon:
      src: /icons/layout.svg
      alt: 页面布局
    title: 灵活页面布局
    details: 页面滚动或整屏 scroll-view，提供顶部、底部、左右与各类状态插槽。
  - icon:
      src: /icons/typescript.svg
      alt: TypeScript
    title: TypeScript 友好
    details: 完整 Props、Methods 和控制器类型，保持 z-paging 使用习惯并注明 wevu 差异。
---
