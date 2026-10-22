---
title: Realtime Chart Server
description: Retrieve chart bars, live statistics, and open prices using chart codes and period types.
---

Realtime Chart Server provides chart bars, open prices, and live statistics for supported instruments. Use its REST API with the chart code returned by FxServer.

## API workflow

1. Call FxServer `GET /chartCode` to map a contract code to a chart code.
2. Select a supported [period type](#period-type-mapping).
3. Retrieve chart bars for the chart code and period type.
4. Retrieve the latest cached bar when only the latest value is needed.
5. Retrieve open-price or live-statistics data when needed.

## Resolve the chart code with FxServer

Realtime Chart Server requires a chart code in the `{instrument}` path parameter. Call FxServer `/chartCode` and use the value associated with the contract code.

```bash
curl "$FXSERVER_URL/chartCode"
```

The endpoint does not require authentication. It returns a mapping from contract code to chart code:

```json
{
  "XAUUSD": "XAUUSDUSD",
  "EURUSD": "EURUSDUSD",
  "USDJPY": "USDUSDJPY"
}
```

For example, use `EURUSDUSD` as `{instrument}` when requesting chart data for the `EURUSD` contract. Do not assume that contract and chart codes are identical. FxServer caches the mapping for 30 minutes, so mapping changes can take up to 30 minutes to appear.

See [`GET /chartCode` in the FxServer Trader API](../fx-server/openapi-trader.mdx) for the response schema.

## Available data

| Operation | Purpose |
| --- | --- |
| `GET /api/instrument/{instrument}/getChartBarsByEndTimeAndBarNumber/{periodType}/{barNumber}` | Return OHLC bars for an instrument and period. Request no more than 1,000 bars at a time. |
| `GET /api/instrument/{instrument}/getLastBar/{periodType}` | Return the latest cached OHLC bar. |
| `GET /api/instrument/{instrument}/live-statistics` | Return open, high, and low values for the supported statistics windows. |
| `GET /api/instrument/{instrument}/open-price` | Return the service-defined open price for the instrument. |
| `PUT /api/instrument/{instrument}/tick` | Update OHLC data for a chart bar. This operation requires a dealer or FTS Web bearer token. |

See the [Realtime Chart Server API reference](./openapi.mdx) for request and response schemas.

## Load chart bars

This request asks for 200 five-minute bars after `/chartCode` maps the `EURUSD` contract to `EURUSDUSD`. Period type `6` represents five minutes.

```bash
curl "https://chart.example.com/api/instrument/EURUSDUSD/getChartBarsByEndTimeAndBarNumber/6/200"
```

Chart bars contain the chart code in `symbol`, a Unix timestamp in milliseconds, and OHLC values:

```json
[
  {
    "symbol": "EURUSDUSD",
    "time": 1773997200000,
    "open": 1.1521,
    "high": 1.1534,
    "low": 1.1518,
    "close": 1.1529
  }
]
```

Replace `chart.example.com` with the Realtime Chart Server host for your environment.

## Period-type mapping

Chart requests use `periodType`, while chart-bar correction requests use `scale`. Both fields use the following numeric mapping:

| Value | Period | Value | Period |
| ---: | --- | ---: | --- |
| `1` | 1 minute | `11` | 2 minutes |
| `2` | 1 hour | `12` | 3 minutes |
| `3` | 1 day | `13` | 4 minutes |
| `4` | 1 week | `14` | 6 minutes |
| `5` | 1 month | `15` | 10 minutes |
| `6` | 5 minutes | `16` | 12 minutes |
| `7` | 15 minutes | `17` | 20 minutes |
| `8` | 30 minutes | `18` | 3 hours |
| `9` | 2 hours | `19` | 8 hours |
| `10` | 4 hours | `20` | 12 hours |

An invalid period type in a chart read returns `400 Bad Request`. Deployments can enable different period types and retention limits, so use values supported by the target environment.

## Correct a chart bar

Chart-bar correction requires a dealer or FTS Web JWT. Format `date` as `yyyy-MM-dd HH:mm` and use the chart code in the request path.

```bash
curl --request PUT \
  "https://chart.example.com/api/instrument/EURUSDUSD/tick" \
  --header "Authorization: Bearer $CHART_CORRECTION_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "date": "2026-07-20 10:15",
    "open": 1.1521,
    "high": 1.1534,
    "low": 1.1518,
    "close": 1.1529,
    "scale": 6
  }'
```

> **Warning:** Chart-bar correction changes market data. Verify the environment,
> chart code, timestamp, period type, and OHLC values before sending the
> request.
