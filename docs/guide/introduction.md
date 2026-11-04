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

## 平台范围

当前目标是**微信小程序的 wevu 渲染链路**。组件使用 `<view>`、`<scroll-view>` 等小程序视图，不应直接当作普通 Web Vue 组件运行。

nvue 专属 WXS/renderjs 渲染不属于本实现范围；对应方法保留兼容入口，但不代表提供 nvue 支持。

## 与官方项目的关系

组件 API 和文档分类参考 [SmileZXLee/uni-z-paging](https://github.com/SmileZXLee/uni-z-paging)，并根据 wevu 的真实运行行为调整。官方项目与本项目均采用 MIT 许可证，原版权声明已保留。

继续阅读：[安装与快速开始](./getting-started)。
