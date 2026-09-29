---
sidebar_position: 1
title: Make your first trade
description: Use an API key from API Key Management to retrieve contract settings and submit a market deal.
---

This guide starts with an API key and connection settings from the API Key Management page, exchanges the key for an access token, and submits a market deal to FxServer.

## 1. Create and copy an API key

Log in to the Trading Terminal and open the API Key Management page. Create an API key with `read` and `trade` permissions, then copy the generated key and the WebProxy and FxServer REST endpoints supplied for the account.

The API key is shown only when it is generated. Store it securely and do not expose it in client-side code, logs, or version control.

Set the copied values in a secure local environment:

```bash
export WEB_PROXY_URL="https://your-webproxy-host"
export FXSERVER_URL="https://your-fxserver-host"
export API_KEY="api-key-copied-from-api-key-management"
```

In production, load these values from a server-side secret manager.

## 2. Exchange the API key

```bash
curl --request POST "$WEB_PROXY_URL/api/tokens/auth" \
  --header "Authorization: Bearer $API_KEY"
```

Store `access_token` from the response for the remaining requests:

```bash
export ACCESS_TOKEN="access-token-from-the-token-exchange-response"
```

The `expires_in` value is measured in minutes. Exchange the existing API key again when the access token expires.

## 3. Retrieve the contract settings

This endpoint returns settings for all available contracts. Find the record whose `market` matches the contract you plan to trade:

```bash
curl "$WEB_PROXY_URL/api/contractSetting" \
  --header "Authorization: Bearer $ACCESS_TOKEN"
```

Calculate `amount` in contract units:

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

Send an amount that is at least `minimumAmount` and is a multiple of `incrementAmount`. For example, when `contractSize` is `100,000`, `0.01` lot is an `amount` of `1,000`.

## 4. Submit a market deal

Market mode uses FxServer's latest quote. Set `priceMode` to `1`, and omit `price` and `priceTag`. Replace `123456` with an integer that is unique for this logical request.

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

Use one `clientOrderId` per logical request. If the outcome is uncertain, retry with the same ID rather than generating a new one. A `409 Conflict` response means the server already accepted that ID for the account and trade date; reconcile the original request before taking further action.

## 5. Handle the outcome

- `200 OK` means the request completed successfully.
- `202 Accepted` means the request is still being processed. Inspect `type`, such as `HEDGE`, `DELAY`, or `MANUAL`, and do not treat the response as a completed deal.
- `400 Bad Request` means the request failed validation or a business rule. Inspect the response body.
- `401 Unauthorized` means authentication is missing, invalid, or expired.
- `409 Conflict` means the server already accepted the `clientOrderId` for the account and trade date.
- `429 Too Many Requests` means the request was rate limited.

Connect to `GET /updateEventStream` for position, order, execution, and cancellation updates. Store references returned by successful trade requests and reconcile the stream with the resulting position and order state.

## Optional: Create an API key programmatically

The API Key Management page is the recommended onboarding path. Integrations that need to create a key through WebProxy can first create a login session:

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

Store `sessionToken` from the response. If the response contains a `challenge`, complete the required OTP check with `PATCH /api/session/{sessionId}` before continuing. Then create the API key:

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

The response body contains the API key as plain text. Store it securely, assign it to `API_KEY`, and continue from [Exchange the API key](#2-exchange-the-api-key).

## Next steps

- See [Get live prices](./get-prices.md) to install `fxserverclientpython` and fetch live prices for a contract.
- See [REST API essentials](../fx-server/general-rest-api-information.md) for response handling, retries, and quoted pricing.
- See the [FxServer Trader API](../fx-server/openapi-trader.mdx) for request and event schemas.
- See the [WebProxy API](../web-proxy/openapi.mdx) for account data, contract settings, API keys, and token exchange.
- Open [Trader API Examples](https://github.com/mF-Technologies/trader-api-examples) for runnable REST, market-data, and algo workflows.
