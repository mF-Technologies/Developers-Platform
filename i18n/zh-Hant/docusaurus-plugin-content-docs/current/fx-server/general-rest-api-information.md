---
title: REST API 基礎
description: 驗證請求、理解常見回應、計算有效 amount 並選擇價格模式。
---

本指南介紹 Trader API 流程共用的行為。端點參數、請求內容及回應 schema 請參閱 [FxServer Trader API](./openapi-trader) 及 [WebProxy API](../web-proxy/openapi)。

## HTTP 回應

以下回應由一個或多個端點使用。請查閱每個端點的參考文件，確認它支援的回應。

| 狀態碼 | 意義 | 處理方式 |
| --- | --- | --- |
| `200 OK` | 請求已成功完成。 | 處理回應內容。 |
| `201 Created` | API key 等資源已建立。 | 安全儲存回傳的資源。 |
| `202 Accepted` | 交易請求已接受並進入非同步處理。 | 不要視為已完成；對帳最終狀態。 |
| `400 Bad Request` | 請求未通過驗證或業務規則。 | 檢查回應內容，包括可能出現的 `msg`。 |
| `401 Unauthorized` | 身份驗證資料缺失、無效或已過期。 | 更換或更新端點需要的憑證。 |
| `404 Not Found` | 找不到所請求的資源。 | 核對帳戶、合約、掛單、持倉或參考編號。 |
| `409 Conflict` | FxServer 已接受這個帳戶及交易日期下的相同 `clientOrderId`。 | 對帳原始請求，不要建立新請求。 |
| `429 Too Many Requests` | 請求超出速率限制。 | 按目標環境的速率限制政策處理。 |
| `500 Internal Server Error` | 伺服器無法完成請求。 | 記錄回應，並按重試政策處理。 |
| `503 Service Unavailable` | 服務或交易商無法使用。 | 只按復原政策重試。 |
| `504 Gateway Timeout` | 等待交易商回應逾時。 | 重試前先對帳原始請求。 |

## 身份驗證

建議由 Trading Terminal 的 **API Key Management** 開始：建立 API key，再[交換成 access token](#交換-api-key)。已有 API key 就不需要建立 WebProxy 工作階段。

以下建立工作階段及 API key 的步驟，是透過程式管理 keys 的另一種方式。Bearer 身份驗證必須使用各端點指定的憑證：session token、API key 或 access token，三者不可互換。公開端點（包括 FxServer `GET /chartCode`）不需要 access token。

### 建立工作階段

將交易者憑證發送至 `POST /api/session`：

```json
{
  "checks": {
    "user": {"userId": "your-user-id"},
    "password": {"password": "your-password"}
  }
}
```

儲存回應中的 `sessionToken`。如果回應包含 `challenge`，建立 API key 前先使用 `PATCH /api/session/{sessionId}` 完成必要的 OTP 驗證。

### 建立 API key

呼叫 `POST /api/tokens/new`，並提供 `Authorization: Bearer <sessionToken>`。只請求整合所需的權限：

```json
{
  "name": "integration-name",
  "permissions": ["read", "trade"],
  "expirationDate": "2030-12-31"
}
```

回應內容會以純文字回傳 API key。請將它儲存在伺服器端秘密管理工具。

### 交換 API key

呼叫 `POST /api/tokens/auth`，提供 `Authorization: Bearer <apiKey>`，不要傳送請求內容。回應包含 access token 及以分鐘為單位的有效期：

```json
{
  "access_token": "access-token",
  "expires_in": 60
}
```

將 access token 以 `Authorization: Bearer <accessToken>` 傳給需要 bearer token 身份驗證的端點。Access token 過期後，再次交換同一 API key。

## 計算有效 amount

`amount` 欄位使用合約單位，不是手數。由 `GET /api/contractSetting` 讀取 `market` 與所需合約相符的記錄，然後計算：

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

`amount` 必須不少於 `minimumAmount`，並且是 `incrementAmount` 的倍數。無效數量可能令 FxServer 回傳以下 `msg`：

| `msg` | 意義 |
| --- | --- |
| `620` | `amount` 少於最小交易手數。 |
| `621` | `amount` 不符合已設定的手數增量。 |
| `622` | `amount` 因其他原因無效。 |

## 安全使用 clientOrderId

`clientOrderId` 是由用戶端產生的選填整數，用於偵測重複請求。每個邏輯交易請求產生一個值。如果回應遺失或逾時，使用同一 ID 重試同一請求。

FxServer 接受一個 ID 後，同一帳戶及交易日期下再次使用該 ID 會回傳 `409 Conflict`。此機制可防止重複請求，但不能證明原請求已完成。進一步操作前，先對帳帳戶、持倉、掛單及事件狀態。

## 選擇價格模式

`addDeal` 及 `liquidate` 端點支援兩種價格模式：

- **市價模式（`priceMode: 1`）**：FxServer 使用最新的合資格報價。省略 `price` 及 `priceTag`。
- **報價模式（`priceMode: 2`）**：傳送報價中的 `price`。當伺服器端價格驗證已啟用時，一併傳送 `priceTag`。

由目標環境設定的價格串流取得報價模式所需數值。將報價的價格及 tag 一併傳送，不要修改任何一個值。`priceTag` 格式為 `${tag};${price}`，例如 `LLG1775716357987;4762.9`。

報價模式請求可能回傳 `400 Bad Request` 及以下 `msg`：

| `msg` | 意義 |
| --- | --- |
| `710` | `priceTag` 已過期或無效。 |
| `2001` | 伺服器端價格驗證已啟用，因此必須提供 `priceTag`。 |
