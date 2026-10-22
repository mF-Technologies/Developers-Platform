---
title: REST API essentials
description: Authenticate requests, interpret common responses, calculate valid amounts, and choose a price mode.
---

Use this guide for behavior shared across Trader API workflows. For endpoint parameters, request bodies, and response schemas, see the [FxServer Trader API](./openapi-trader.mdx) and [WebProxy API](../web-proxy/openapi.mdx) references.

## HTTP responses

The following responses are used by one or more endpoints. Check each endpoint reference for its supported responses.

| Code | Meaning | Action |
| --- | --- | --- |
| `200 OK` | The request completed successfully. | Process the response body. |
| `201 Created` | A resource, such as an API key, was created. | Store the returned resource securely. |
| `202 Accepted` | A trade request was accepted for asynchronous processing. | Do not treat it as complete. Reconcile the resulting state. |
| `400 Bad Request` | The request failed validation or a business rule. | Inspect the response body, including `msg` when present. |
| `401 Unauthorized` | Authentication is missing, invalid, or expired. | Replace or refresh the credential required by the endpoint. |
| `404 Not Found` | The requested resource was not found. | Verify the account, contract, order, position, or reference. |
| `409 Conflict` | FxServer already accepted the `clientOrderId` for the account and trade date. | Reconcile the original request instead of creating another one. |
| `429 Too Many Requests` | The request rate limit was exceeded. | Apply the rate-limit policy configured for your environment. |
| `500 Internal Server Error` | The server could not complete the request. | Record the response and follow your retry policy. |
| `503 Service Unavailable` | The service or dealer is unavailable. | Retry only according to your recovery policy. |
| `504 Gateway Timeout` | The dealer response timed out. | Reconcile the original request before retrying. |

## Authentication

Start in **API Key Management** in your Trading Terminal: create an API key, then [exchange it for an access token](#exchange-an-api-key). You do not need to create a WebProxy session when you already have an API key.

The session and API-key creation steps below are an alternative for clients that manage keys programmatically. Bearer authentication uses the credential required by each endpoint: a session token, API key, or access token; these credentials are not interchangeable. Public endpoints, including FxServer `GET /chartCode`, do not require an access token.

### Create a session

Send the trader credentials to `POST /api/session`:

```json
{
  "checks": {
    "user": {"userId": "your-user-id"},
    "password": {"password": "your-password"}
  }
}
```

Store `sessionToken` from the response. If the response contains a `challenge`, complete the required OTP check with `PATCH /api/session/{sessionId}` before creating an API key.

### Create an API key

Send `POST /api/tokens/new` with `Authorization: Bearer <sessionToken>`. Request only the permissions your integration needs:

```json
{
  "name": "integration-name",
  "permissions": ["read", "trade"],
  "expirationDate": "2030-12-31"
}
```

The response body contains the API key as plain text. Store it in a server-side secret manager.

### Exchange an API key

Send `POST /api/tokens/auth` with `Authorization: Bearer <apiKey>` and no request body. The response contains an access token and its lifetime in minutes:

```json
{
  "access_token": "access-token",
  "expires_in": 60
}
```

Send the access token as `Authorization: Bearer <accessToken>` to endpoints that require bearer authentication. Exchange the same API key again when the access token expires.

## Calculate a valid amount

The `amount` field uses contract units, not lots. Retrieve the contract record whose `market` matches the requested contract from `GET /api/contractSetting`, then calculate:

```text
amount = lotQuantity × contractSize
minimumAmount = minTradeLot × contractSize
incrementAmount = minLotIncrementUnit × contractSize
```

Send an amount that is at least `minimumAmount` and is a multiple of `incrementAmount`. FxServer can return these `msg` values for invalid sizing:

| `msg` | Meaning |
| --- | --- |
| `620` | The amount is below the minimum trade lot. |
| `621` | The amount does not match the configured lot increment. |
| `622` | The amount is otherwise invalid. |

## Use clientOrderId safely

`clientOrderId` is an optional client-generated integer used for duplicate-request detection. Generate one value for each logical trade request. If a response is lost or times out, retry the same request with the same ID.

After FxServer accepts an ID, another request with that ID for the same account and trade date returns `409 Conflict`. A conflict prevents a duplicate request, but it does not prove that the original request completed. Reconcile account, position, order, and event state before taking further action.

## Choose a price mode

The `addDeal` and `liquidate` endpoints support two price modes:

- **Market mode (`priceMode: 1`)**: FxServer uses its latest eligible quote. Omit `price` and `priceTag`.
- **Quoted mode (`priceMode: 2`)**: Send the quoted `price`. Send `priceTag` when server-side price checking is enabled.

Obtain quoted-mode values from the price feed configured for your environment. Send the quote's price and tag together without modifying either value. Format `priceTag` as `${tag};${price}`, for example `LLG1775716357987;4762.9`.

A quoted request can return `400 Bad Request` with one of these `msg` values:

| `msg` | Meaning |
| --- | --- |
| `710` | The price tag is stale or invalid. |
| `2001` | A price tag is required because server-side price checking is enabled. |
