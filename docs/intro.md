---
sidebar_position: 1
slug: /intro
title: Platform overview
description: Understand the Trader APIs and follow the recommended integration workflow.
---

## Choose how to connect

- **Use your AI assistant:** [Connect your AI tool with MCP](./getting-started/connect-your-ai.mdx) to ask about your account, prices and market data. Start read-only; demo trading requires separate approval.
- **Build with code:** [Make your first trade](./getting-started/first-trade.md) with REST, or use the [Trader API Client Starter Kit](https://github.com/mF-Technologies/trader-api-client-starter-kit) for runnable examples and algorithms.

The REST integration below separates authentication, trading, and chart data into three APIs. The MCP adapter handles these connections for you.

| Surface | Use it for |
| --- | --- |
| **WebProxy API** | Create sessions, manage API keys and access tokens, and retrieve account and contract data. |
| **FxServer Trader API** | Submit market deals, manage orders, liquidate positions, retrieve account state, and receive live updates. |
| **Realtime Chart Server API** | Use chart codes from FxServer `/chartCode` to retrieve OHLC bars, open prices, and market statistics. |

## Integration workflow

Start from the API Key Management page in the Trading Terminal:

1. Create an API key with `read` permission for live prices and `trade` permission for trading operations.
2. Copy the API key and the connection settings supplied for the account.
3. Exchange the API key for a short-lived access token with WebProxy `POST /api/tokens/auth`.
4. Retrieve the selected contract settings and calculate a valid amount.
5. For an algorithmic strategy, use `fxserverclientpython` for live prices and Realtime Chart Server for historical bars.
6. Submit the resulting market deal or order through the FxServer REST API.
7. Connect to `GET /updateEventStream` and reconcile asynchronous updates.

The supported Phase 1 integration keeps pricing and trading responsibilities separate: the Python client provides live prices, ChartServer provides historical bars, and FxServer REST endpoints perform trading operations.

Follow [Make your first trade](./getting-started/first-trade.md) for the REST request sequence, [Get live prices](./getting-started/get-prices.md) for the Python price client, and [Realtime Chart Server](./realtime-chart-server/overview.md) for historical bars. See [REST API essentials](./fx-server/general-rest-api-information.md) for authentication, response handling, amount calculation, and price modes.

## Before you trade

> **Warning:** Trade requests can create real financial positions. Use a test
> environment first. Before sending a production request, verify the
> environment, account, contract, direction, and amount.

- Store API keys and access tokens in a server-side secret manager. Do not expose them in client-side code, logs, or version control.
- The `amount` field uses contract units, not lots. Calculate it from the selected contract settings.
- A `202 Accepted` response means processing continues asynchronously. It does not confirm a completed trade.
- Generate one `clientOrderId` for each logical trade request. Reuse that ID only when retrying the same request.
- Handle authentication, validation, duplicate-request, rate-limit, service, and dealer failures explicitly.

## Choose a reference

- [FxServer Trader API](./fx-server/openapi-trader.mdx) for trading and live state.
- [WebProxy API](./web-proxy/openapi.mdx) for sessions, tokens, account data, and contract settings.
- [Realtime Chart Server](./realtime-chart-server/overview.md) for chart data and period types.
