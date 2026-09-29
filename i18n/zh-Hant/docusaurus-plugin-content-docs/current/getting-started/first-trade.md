---
sidebar_position: 1
title: 完成第一筆交易
description: 使用 API Key Management 建立的 API key，讀取合約設定並提交市價交易。
---

本指南由 API Key Management 頁面開始：取得 API key 及連線設定，交換成 access token，再向 FxServer 提交市價交易。

## 1. 建立並複製 API key

登入 Trading Terminal，開啟 API Key Management 頁面。建立同時具有 `read` 及 `trade` 權限的 API key，然後複製系統為這個帳戶提供的 API key、WebProxy 及 FxServer REST 端點。

API key 只會在建立時顯示一次。請安全儲存，不要放入用戶端程式碼、日誌或版本控制系統。

將複製的資料存入安全的本機環境：

```bash
export WEB_PROXY_URL="https://your-webproxy-host"
export FXSERVER_URL="https://your-fxserver-host"
export API_KEY="api-key-copied-from-api-key-management"
```

正式環境應由伺服器端秘密管理工具讀取這些資料。

## 2. 交換 API key

```bash
curl --request POST "$WEB_PROXY_URL/api/tokens/auth" \
  --header "Authorization: Bearer $API_KEY"
```

由回應取得 `access_token`，供後續請求使用：

```bash
export ACCESS_TOKEN="access-token-from-the-token-exchange-response"
```

`expires_in` 以分鐘為單位。Access token 過期後，再次使用原有 API key 交換即可。

## 3. 讀取合約設定

這個端點會回傳所有可用合約的設定。找出 `market` 與你要交易的合約相符的記錄：

```bash
curl "$WEB_PROXY_URL/api/contractSetting" \
  --header "Authorization: Bearer $ACCESS_TOKEN"
```

`amount` 使用合約單位，計算方式如下：

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

`amount` 必須不少於 `minimumAmount`，並且是 `incrementAmount` 的倍數。例如 `contractSize` 為 `100,000` 時，`0.01` 手對應的 `amount` 為 `1,000`。

## 4. 提交市價交易

市價模式會使用 FxServer 的最新報價。將 `priceMode` 設為 `1`，並省略 `price` 及 `priceTag`。請將 `123456` 替換為這個邏輯請求的唯一整數。

```bash
curl --request POST "$FXSERVER_URL/addDeal" \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "clientOrderId": 123456,
    "priceMode": 1,
    "contractCode": "EURUSD",
    "amount": 1000,
    "buyOrSell": true
  }'
```

每個邏輯請求只使用一個 `clientOrderId`。如果無法確認處理結果，重試時應沿用同一個 ID，不要產生新 ID。`409 Conflict` 表示伺服器已接受這個帳戶及交易日期下的相同 ID；請先對帳，再進行下一步。

## 5. 處理交易結果

- `200 OK` 表示請求已成功完成。
- `202 Accepted` 表示請求仍在處理。請檢查 `type`，例如 `HEDGE`、`DELAY` 或 `MANUAL`，不要將回應視為已完成交易。
- `400 Bad Request` 表示請求未通過驗證或業務規則。請檢查回應內容。
- `401 Unauthorized` 表示身份驗證資料缺失、無效或已過期。
- `409 Conflict` 表示伺服器已接受相同 `clientOrderId`。
- `429 Too Many Requests` 表示請求已超出速率限制。

連接 `GET /updateEventStream` 接收持倉、掛單、執行及取消更新。儲存交易請求成功時回傳的參考編號，並將事件串流與實際持倉及掛單狀態對帳。

## 選用：以程式建立 API key

API Key Management 頁面是建議的入門方式。需要透過 WebProxy 建立 API key 的整合，可以先建立登入 session：

```bash
export TRADER_USER="your-user-id"
export TRADER_PASSWORD="your-password"

curl --request POST "$WEB_PROXY_URL/api/session" \
  --header 'Content-Type: application/json' \
  --data "{
    \"checks\": {
      \"user\": {\"userId\": \"$TRADER_USER\"},
      \"password\": {\"password\": \"$TRADER_PASSWORD\"}
    }
  }"
```

儲存回應中的 `sessionToken`。如果回應包含 `challenge`，繼續前先使用 `PATCH /api/session/{sessionId}` 完成所需的 OTP 驗證，然後建立 API key：

```bash
export SESSION_TOKEN="session-token-from-the-login-response"

curl --request POST "$WEB_PROXY_URL/api/tokens/new" \
  --header "Authorization: Bearer $SESSION_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "local-onboarding",
    "permissions": ["read", "trade"],
    "expirationDate": "2030-12-31"
  }'
```

回應內容以純文字提供 API key。請安全儲存，將它設為 `API_KEY`，再由[交換 API key](#2-交換-api-key)繼續。

## 後續步驟

- 閱讀 [取得即時價格](./get-prices)，安裝 `fxserverclientpython` 並取得即時價格。
- 閱讀 [REST API 基礎](../fx-server/general-rest-api-information)，了解回應處理、重試及報價模式。
- 查看 [FxServer Trader API](../fx-server/openapi-trader) 的請求及事件 schema。
- 查看 [WebProxy API](../web-proxy/openapi) 的帳戶資料、合約設定、API keys 及 token 交換流程。
- 開啟 [Trader API 範例](https://github.com/mF-Technologies/trader-api-examples)，參考可執行的 REST、市場數據及 algo 流程。
