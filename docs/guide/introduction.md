# 介绍

`z-paging-wevu` 是 z-paging 2.8.x 在 **weapp-vite + wevu + Vue SFC** 技术栈下的独立兼容实现，不是官方 uni-app 组件的简单改名，也不依赖原组件运行时。

## 已实现能力

- 自动分页、下拉刷新、触底与点击加载更多。
- `complete`、`completeByKey`、`completeByTotal`、`completeByNoMore` 等结果提交方式。
- `fetch` 内置请求、本地分页、缓存和刷新时间。
- 页面滚动与整屏 `scroll-view` 两种布局。
- 空态、加载失败、返回顶部、滚动定位和完整状态事件。
- 固定/动态高度虚拟列表、聊天记录与键盘适配。
- 自定义下拉刷新、二楼 F2、国际化文本与公开插槽。
- WXS 下拉刷新：位移由 WXS 在视图层直接写，拖动不经过 `setData`；确认下拉后整个手势被接管，往回推不会带动列表。

## 平台范围

本项目是**微信小程序**组件库，运行在 weapp-vite + wevu 的渲染链路里；它不是 uni-app 组件，也没有 H5、App、nvue 这些平台产物。组件依赖 `wx.*` 接口和 `<view>`、`<scroll-view>` 等小程序视图，不应直接当作普通 Web Vue 组件运行。

原版 z-paging 文档里 H5、App、nvue 相关的章节和特效，在这里没有对应实现。`setListSpecialEffects`、`setSpecialEffects` 只为减少迁移时的调用错误保留为空方法，调用不会产生任何效果。

## 与官方项目的关系

组件 API 和文档分类参考 [SmileZXLee/uni-z-paging](https://github.com/SmileZXLee/uni-z-paging)，并根据 wevu 的真实运行行为调整。官方项目与本项目均采用 MIT 许可证，原版权声明已保留。

继续阅读：[安装与快速开始](./getting-started)。
