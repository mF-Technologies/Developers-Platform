---
title: REST API 基础
description: 验证请求、理解常见响应、计算有效 amount 并选择价格模式。
---

本指南介绍 Trader API 流程共用的行为。端点参数、请求内容及响应 schema 请参阅 [FxServer Trader API](./openapi-trader) 及 [WebProxy API](../web-proxy/openapi)。

## HTTP 响应

以下响应由一个或多个端点使用。请查阅每个端点的参考文档，确认它支持的响应。

| 状态码 | 意义 | 处理方式 |
| --- | --- | --- |
| `200 OK` | 请求已成功完成。 | 处理响应内容。 |
| `201 Created` | API key 等资源已创建。 | 安全存储返回的资源。 |
| `202 Accepted` | 交易请求已接受并进入异步处理。 | 不要视为已完成；对账最终状态。 |
| `400 Bad Request` | 请求未通过验证或业务规则。 | 检查响应内容，包括可能出现的 `msg`。 |
| `401 Unauthorized` | 身份验证数据缺失、无效或已过期。 | 更换或更新端点需要的凭证。 |
| `404 Not Found` | 找不到所请求的资源。 | 核对账户、合约、挂单、持仓或参考编号。 |
| `409 Conflict` | FxServer 已接受这个账户及交易日期下的相同 `clientOrderId`。 | 对账原始请求，不要创建新请求。 |
| `429 Too Many Requests` | 请求超出速率限制。 | 按目标环境的速率限制政策处理。 |
| `500 Internal Server Error` | 服务器无法完成请求。 | 记录响应，并按重试政策处理。 |
| `503 Service Unavailable` | 服务或交易商无法使用。 | 只按复原政策重试。 |
| `504 Gateway Timeout` | 等待交易商响应超时。 | 重试前先对账原始请求。 |

## 身份验证

建议从 Trading Terminal 的 **API Key Management** 开始：创建 API key，再[交换成 access token](#交换-api-key)。已有 API key 就不需要创建 WebProxy 会话。

以下创建会话及 API key 的步骤，是通过程序管理 keys 的另一种方式。Bearer 身份验证必须使用各端点指定的凭证：session token、API key 或 access token，三者不可互换。公开端点（包括 FxServer `GET /chartCode`）不需要 access token。

### 创建会话

将交易者凭证发送至 `POST /api/session`：

```json
{
  "checks": {
    "user": {"userId": "your-user-id"},
    "password": {"password": "your-password"}
  }
}
```

存储响应中的 `sessionToken`。如果响应包含 `challenge`，创建 API key 前先使用 `PATCH /api/session/{sessionId}` 完成必要的 OTP 验证。

### 创建 API key

调用 `POST /api/tokens/new`，并提供 `Authorization: Bearer <sessionToken>`。只请求集成所需的权限：

```json
{
  "name": "integration-name",
  "permissions": ["read", "trade"],
  "expirationDate": "2030-12-31"
}
```

响应内容会以纯文字返回 API key。请将它存储在服务器端秘密管理工具。

### 交换 API key

调用 `POST /api/tokens/auth`，提供 `Authorization: Bearer <apiKey>`，不要传送请求内容。响应包含 access token 及以分钟为单位的有效期：

```json
{
  "access_token": "access-token",
  "expires_in": 60
}
```

将 access token 以 `Authorization: Bearer <accessToken>` 传给需要 bearer token 身份验证的端点。Access token 过期后，再次交换同一 API key。

## 计算有效 amount

`amount` 字段使用合约单位，不是手数。由 `GET /api/contractSetting` 读取 `market` 与所需合约相符的记录，然后计算：

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

`amount` 必须不少于 `minimumAmount`，并且是 `incrementAmount` 的倍数。无效数量可能令 FxServer 返回以下 `msg`：

| `msg` | 意义 |
| --- | --- |
| `620` | `amount` 少于最小交易手数。 |
| `621` | `amount` 不符合已设置的手数增量。 |
| `622` | `amount` 因其他原因无效。 |

## 安全使用 clientOrderId

`clientOrderId` 是由客户端生成的选填整数，用于检测重复请求。每个逻辑交易请求生成一个值。如果响应遗失或超时，使用同一 ID 重试同一请求。

FxServer 接受一个 ID 后，同一账户及交易日期下再次使用该 ID 会返回 `409 Conflict`。此机制可防止重复请求，但不能证明原请求已完成。进一步操作前，先对账账户、持仓、挂单及事件状态。

## 选择价格模式

`addDeal` 及 `liquidate` 端点支持两种价格模式：

- **市价模式（`priceMode: 1`）**：FxServer 使用最新的合资格报价。省略 `price` 及 `priceTag`。
- **报价模式（`priceMode: 2`）**：传送报价中的 `price`。当服务器端价格验证已启用时，一并传送 `priceTag`。

由目标环境设置的价格数据流获取报价模式所需值。将报价的价格及 tag 一并传送，不要修改任何一个值。`priceTag` 格式为 `${tag};${price}`，例如 `LLG1775716357987;4762.9`。

报价模式请求可能返回 `400 Bad Request` 及以下 `msg`：

| `msg` | 意义 |
| --- | --- |
| `710` | `priceTag` 已过期或无效。 |
| `2001` | 服务器端价格验证已启用，因此必须提供 `priceTag`。 |
