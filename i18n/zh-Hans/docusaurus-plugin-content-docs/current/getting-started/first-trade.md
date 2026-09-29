---
sidebar_position: 1
title: 完成第一笔交易
description: 使用 API Key Management 创建的 API key，读取合约设置并提交市价交易。
---

本指南由 API Key Management 页面开始：获取 API key 及连接设置，交换成 access token，再向 FxServer 提交市价交易。

## 1. 创建并复制 API key

登录 Trading Terminal，打开 API Key Management 页面。创建同时具有 `read` 及 `trade` 权限的 API key，然后复制系统为这个账户提供的 API key、WebProxy 及 FxServer REST 端点。

API key 只会在创建时显示一次。请安全存储，不要放入客户端代码、日志或版本控制系统。

将复制的数据存入安全的本机环境：

```bash
export WEB_PROXY_URL="https://your-webproxy-host"
export FXSERVER_URL="https://your-fxserver-host"
export API_KEY="api-key-copied-from-api-key-management"
```

正式环境应由服务器端秘密管理工具读取这些数据。

## 2. 交换 API key

```bash
curl --request POST "$WEB_PROXY_URL/api/tokens/auth" \
  --header "Authorization: Bearer $API_KEY"
```

由响应获取 `access_token`，供后续请求使用：

```bash
export ACCESS_TOKEN="access-token-from-the-token-exchange-response"
```

`expires_in` 以分钟为单位。Access token 过期后，再次使用原有 API key 交换即可。

## 3. 读取合约设置

这个端点会返回所有可用合约的设置。找出 `market` 与你要交易的合约相符的记录：

```bash
curl "$WEB_PROXY_URL/api/contractSetting" \
  --header "Authorization: Bearer $ACCESS_TOKEN"
```

`amount` 使用合约单位，计算方式如下：

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

`amount` 必须不少于 `minimumAmount`，并且是 `incrementAmount` 的倍数。例如 `contractSize` 为 `100,000` 时，`0.01` 手对应的 `amount` 为 `1,000`。

## 4. 提交市价交易

市价模式会使用 FxServer 的最新报价。将 `priceMode` 设为 `1`，并省略 `price` 及 `priceTag`。请将 `123456` 替换为这个逻辑请求的唯一整数。

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

每个逻辑请求只使用一个 `clientOrderId`。如果无法确认处理结果，重试时应沿用同一个 ID，不要生成新 ID。`409 Conflict` 表示服务器已接受这个账户及交易日期下的相同 ID；请先对账，再进行下一步。

## 5. 处理交易结果

- `200 OK` 表示请求已成功完成。
- `202 Accepted` 表示请求仍在处理。请检查 `type`，例如 `HEDGE`、`DELAY` 或 `MANUAL`，不要将响应视为已完成交易。
- `400 Bad Request` 表示请求未通过验证或业务规则。请检查响应内容。
- `401 Unauthorized` 表示身份验证数据缺失、无效或已过期。
- `409 Conflict` 表示服务器已接受相同 `clientOrderId`。
- `429 Too Many Requests` 表示请求已超出速率限制。

连接 `GET /updateEventStream` 接收持仓、挂单、执行及取消更新。存储交易请求成功时返回的参考编号，并将事件数据流与实际持仓及挂单状态对账。

## 可选：通过程序创建 API key

API Key Management 页面是建议的入门方式。需要通过 WebProxy 创建 API key 的集成，可以先创建登录会话：

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

存储响应中的 `sessionToken`。如果响应包含 `challenge`，继续前先使用 `PATCH /api/session/{sessionId}` 完成所需的 OTP 验证，然后创建 API key：

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

响应内容以纯文本提供 API key。请安全存储，将它设置为 `API_KEY`，再从[交换 API key](#2-交换-api-key)继续。

## 后续步骤

- 阅读 [获取实时价格](./get-prices)，安装 `fxserverclientpython` 并获取实时价格。
- 阅读 [REST API 基础](../fx-server/general-rest-api-information)，了解响应处理、重试及报价模式。
- 查看 [FxServer Trader API](../fx-server/openapi-trader) 的请求及事件 schema。
- 查看 [WebProxy API](../web-proxy/openapi) 的账户数据、合约设置、API keys 及 token 交换流程。
- 打开 [Trader API 示例](https://github.com/mF-Technologies/trader-api-examples)，参考可运行的 REST、市场数据及 algo 流程。
