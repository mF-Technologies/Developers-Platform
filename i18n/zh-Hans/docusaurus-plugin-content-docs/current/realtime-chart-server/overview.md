---
title: Realtime Chart Server
description: 使用 chart code 及周期类型读取 K 线、实时统计及开盘价。
---

Realtime Chart Server 为受支持的交易产品提供 K 线、开盘价及实时统计。使用 FxServer 返回的 chart code 调用它的 REST API。

## API 流程

1. 调用 FxServer `GET /chartCode`，将 contract code 对应到 chart code。
2. 选择受支持的[周期类型](#周期类型对应)。
3. 按 chart code 及周期类型读取 K 线。
4. 如果只需最新值，读取最后一个缓存 K 线。
5. 有需要时读取开盘价或实时统计数据。

## 使用 FxServer 获取 chart code

Realtime Chart Server 需要在 `{instrument}` 路径参数使用 chart code。调用 FxServer `/chartCode`，并取用与 contract code 对应的值。

```bash
curl "$FXSERVER_URL/chartCode"
```

这个端点不需要身份验证，并返回 contract code 至 chart code 的对应：

```json
{
  "XAUUSD": "XAUUSDUSD",
  "EURUSD": "EURUSDUSD",
  "USDJPY": "USDUSDJPY"
}
```

例如，读取 `EURUSD` 合约的图表数据时，将 `EURUSDUSD` 用作 `{instrument}`。不要假设 contract code 与 chart code 相同。FxServer 会缓存这项对应 30 分钟，因此对应变更最多需要 30 分钟才会显示。

返回 schema 请参阅 FxServer Trader API 的 [`GET /chartCode`](../fx-server/openapi-trader)。

## 可用数据

| 操作 | 用途 |
| --- | --- |
| `GET /api/instrument/{instrument}/getChartBarsByEndTimeAndBarNumber/{periodType}/{barNumber}` | 返回指定交易产品及周期的 OHLC K 线。每次最多请求 1,000 根 K 线。 |
| `GET /api/instrument/{instrument}/getLastBar/{periodType}` | 返回最新的缓存 OHLC K 线。 |
| `GET /api/instrument/{instrument}/live-statistics` | 返回受支持统计周期的 open、high 及 low。 |
| `GET /api/instrument/{instrument}/open-price` | 返回服务定义的交易产品开盘价。 |
| `PUT /api/instrument/{instrument}/tick` | 更新 K 线的 OHLC 数据。操作需要交易商或 FTS Web bearer token。 |

有关请求及响应 schema，请参阅 [Realtime Chart Server API](./openapi)。

## 读取 K 线

以下请求假设 `/chartCode` 已将 `EURUSD` 合约对应到 `EURUSDUSD`，并读取 200 根 5 分钟 K 线。周期类型 `6` 代表 5 分钟。

```bash
curl "https://chart.example.com/api/instrument/EURUSDUSD/getChartBarsByEndTimeAndBarNumber/6/200"
```

K 线数据在 `symbol` 提供 chart code，并包含以毫秒为单位的 Unix 时间戳及 OHLC 数值：

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

将 `chart.example.com` 替换为目标环境的 Realtime Chart Server 主机。

## 周期类型对应

图表请求使用 `periodType`，K 线修正请求使用 `scale`。两个字段使用相同数值对应：

| 值 | 周期 | 值 | 周期 |
| ---: | --- | ---: | --- |
| `1` | 1 分钟 | `11` | 2 分钟 |
| `2` | 1 小时 | `12` | 3 分钟 |
| `3` | 1 日 | `13` | 4 分钟 |
| `4` | 1 星期 | `14` | 6 分钟 |
| `5` | 1 个月 | `15` | 10 分钟 |
| `6` | 5 分钟 | `16` | 12 分钟 |
| `7` | 15 分钟 | `17` | 20 分钟 |
| `8` | 30 分钟 | `18` | 3 小时 |
| `9` | 2 小时 | `19` | 8 小时 |
| `10` | 4 小时 | `20` | 12 小时 |

读取图表时使用无效周期类型会返回 `400 Bad Request`。不同部署可以启用不同周期类型及数据保留上限，请使用目标环境支持的值。

## 修正 K 线

K 线修正需要交易商或 FTS Web JWT。`date` 格式为 `yyyy-MM-dd HH:mm`，请求路径使用 chart code。

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

> **警告：** K 线修正会更改市场数据。提交请求前，必须核对环境、chart code、时间戳、周期类型及 OHLC 数值。
