---
sidebar_position: 1
slug: /intro
title: 平台概览
description: 了解 Trader APIs，并按建议流程完成集成。
---

## 选择接入方式

- **使用 AI 助手：** [通过 MCP 连接 AI 工具](./getting-started/connect-your-ai)，以对话查询账户、报价及市场数据。先以只读方式开始；demo 交易需要独立批准。
- **自行编写程序：** 按[完成第一笔交易](./getting-started/first-trade)使用 REST，或使用 [Trader API Client Starter Kit](https://github.com/mF-Technologies/trader-api-client-starter-kit) 的可执行示例及算法。

以下 REST 集成将身份验证、交易及图表数据分由三组 API 处理。MCP adapter 会为你处理这些连接。

| 服务 | 用途 |
| --- | --- |
| **WebProxy API** | 创建会话、管理 API keys 及 access tokens，并读取账户及合约数据。 |
| **FxServer Trader API** | 提交市价交易、管理挂单、平仓、读取账户状态及接收实时更新。 |
| **Realtime Chart Server API** | 使用 FxServer `/chartCode` 返回的 chart code 读取 OHLC K 线、开盘价及市场统计。 |

## 集成流程

由 Trading Terminal 内的 API Key Management 页面开始：

1. 创建 API key：获取实时价格需要 `read` 权限；进行交易需要 `trade` 权限。
2. 复制 API key 及系统为账户提供的连接设置。
3. 使用 WebProxy `POST /api/tokens/auth` 将 API key 交换成短期 access token。
4. 读取选择的合约的设置，并计算有效 `amount`。
5. 算法策略使用 `fxserverclientpython` 获取实时价格，并由 Realtime Chart Server 读取历史 K 线。
6. 使用 FxServer REST API 提交市价交易或挂单。
7. 连接 `GET /updateEventStream`，将异步更新与交易状态对账。

第一阶段的集成方式将价格及交易责任分开：Python 客户端提供实时价格，ChartServer 提供历史 K 线，FxServer REST 端点负责交易操作。

按 [完成第一笔交易](./getting-started/first-trade) 了解 REST 请求流程；阅读 [获取实时价格](./getting-started/get-prices) 使用 Python 价格客户端；阅读 [Realtime Chart Server](./realtime-chart-server/overview) 获取历史 K 线。有关身份验证、响应处理、`amount` 计算及价格模式，请参阅 [REST API 基础](./fx-server/general-rest-api-information)。

## 交易前检查

> **警告：** 交易请求可能创建真实金融持仓。请先在测试环境操作。提交正式环境请求前，必须核对环境、账户、合约、方向及数量。

- 将 API keys 及 access tokens 存储在服务器端秘密管理工具，不要放入客户端代码、日志或版本控制系统。
- `amount` 使用合约单位，不是手数。请根据选择的合约设置计算。
- `202 Accepted` 表示系统仍在异步处理，不代表交易已完成。
- 每个逻辑交易请求生成一个 `clientOrderId`。只有重试同一请求时才沿用该 ID。
- 必须明确处理身份验证、验证、重复请求、速率限制、服务及交易商故障。

## 选择参考文档

- [FxServer Trader API](./fx-server/openapi-trader) 用于交易及实时状态。
- [WebProxy API](./web-proxy/openapi) 用于会话、tokens、账户数据及合约设置。
- [Realtime Chart Server](./realtime-chart-server/overview) 用于图表数据及周期类型。
