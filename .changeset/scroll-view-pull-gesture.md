---
"z-paging-wevu": patch
---

scroll-view 分支默认改用 WXS 位移的自定义下拉刷新，避免原生 refresher 回推时把列表一起滚走；PC 微信（mac / windows）没有下拉手势，自动回退到自定义刷新。
