---
sidebar_position: 1
slug: /intro
title: 平台概覽
description: 了解 Trader APIs，並按建議流程完成整合。
---

## 選擇接入方式

- **使用 AI 助手：** [透過 MCP 連接 AI 工具](./getting-started/connect-your-ai)以對話查詢帳戶、報價及市場數據。先以唯讀方式開始；demo 交易需要獨立批准。
- **自行編寫程式：** 按[完成第一筆交易](./getting-started/first-trade)使用 REST，或使用 [Trader API Client Starter Kit](https://github.com/mF-Technologies/trader-api-client-starter-kit) 的可執行範例及演算法。

以下 REST 整合將身份驗證、交易及圖表數據分由三組 API 處理。MCP adapter 會代你處理這些連線。

| 服務 | 用途 |
| --- | --- |
| **WebProxy API** | 建立工作階段、管理 API keys 及 access tokens，並讀取帳戶及合約資料。 |
| **FxServer Trader API** | 提交市價交易、管理掛單、平倉、讀取帳戶狀態及接收即時更新。 |
| **Realtime Chart Server API** | 使用 FxServer `/chartCode` 回傳的 chart code 讀取 OHLC K 線、開市價及市場統計。 |

## 整合流程

由 Trading Terminal 內的 API Key Management 頁面開始：

1. 建立 API key：取得即時價格需要 `read` 權限；進行交易需要 `trade` 權限。
2. 複製 API key 及系統為帳戶提供的連線設定。
3. 使用 WebProxy `POST /api/tokens/auth` 將 API key 交換成短效 access token。
4. 讀取所選合約的設定，並計算有效 `amount`。
5. 演算法策略使用 `fxserverclientpython` 取得即時價格，並由 Realtime Chart Server 讀取歷史 K 線。
6. 使用 FxServer REST API 提交市價交易或掛單。
7. 連接 `GET /updateEventStream`，將非同步更新與交易狀態對帳。

第一階段的整合方式將價格及交易責任分開：Python 用戶端提供即時價格，ChartServer 提供歷史 K 線，FxServer REST 端點負責交易操作。

按 [完成第一筆交易](./getting-started/first-trade) 了解 REST 請求流程；閱讀 [取得即時價格](./getting-started/get-prices) 使用 Python 價格用戶端；閱讀 [Realtime Chart Server](./realtime-chart-server/overview) 取得歷史 K 線。有關身份驗證、回應處理、`amount` 計算及價格模式，請參閱 [REST API 基礎](./fx-server/general-rest-api-information)。

## 交易前檢查

> **警告：** 交易請求可能建立真實金融持倉。請先在測試環境操作。提交正式環境請求前，必須核對環境、帳戶、合約、方向及數量。

- 將 API keys 及 access tokens 儲存在伺服器端秘密管理工具，不要放入用戶端程式碼、日誌或版本控制系統。
- `amount` 使用合約單位，不是手數。請根據所選合約設定計算。
- `202 Accepted` 表示系統仍在非同步處理，不代表交易已完成。
- 每個邏輯交易請求產生一個 `clientOrderId`。只有重試同一請求時才沿用該 ID。
- 必須明確處理身份驗證、驗證、重複請求、速率限制、服務及交易商故障。

## 選擇參考文件

- [FxServer Trader API](./fx-server/openapi-trader) 用於交易及即時狀態。
- [WebProxy API](./web-proxy/openapi) 用於工作階段、tokens、帳戶資料及合約設定。
- [Realtime Chart Server](./realtime-chart-server/overview) 用於圖表數據及週期類型。
