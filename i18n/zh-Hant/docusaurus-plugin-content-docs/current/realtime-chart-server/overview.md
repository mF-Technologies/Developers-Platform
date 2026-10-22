---
title: Realtime Chart Server
description: 使用 chart code 及週期類型讀取 K 線、即時統計及開市價。
---

Realtime Chart Server 為受支援的交易產品提供 K 線、開市價及即時統計。使用 FxServer 回傳的 chart code 呼叫它的 REST API。

## API 流程

1. 呼叫 FxServer `GET /chartCode`，將 contract code 對應到 chart code。
2. 選擇受支援的[週期類型](#週期類型對應)。
3. 按 chart code 及週期類型讀取 K 線。
4. 如果只需最新值，讀取最後一個快取 K 線。
5. 有需要時讀取開市價或即時統計數據。

## 使用 FxServer 取得 chart code

Realtime Chart Server 需要在 `{instrument}` 路徑參數使用 chart code。呼叫 FxServer `/chartCode`，並取用與 contract code 對應的值。

```bash
curl "$FXSERVER_URL/chartCode"
```

這個端點不需要身份驗證，並回傳 contract code 至 chart code 的對應：

```json
{
  "XAUUSD": "XAUUSDUSD",
  "EURUSD": "EURUSDUSD",
  "USDJPY": "USDUSDJPY"
}
```

例如，讀取 `EURUSD` 合約的圖表數據時，將 `EURUSDUSD` 用作 `{instrument}`。不要假設 contract code 與 chart code 相同。FxServer 會快取這項對應 30 分鐘，因此對應變更最多需要 30 分鐘才會顯示。

回傳 schema 請參閱 FxServer Trader API 的 [`GET /chartCode`](../fx-server/openapi-trader)。

## 可用數據

| 操作 | 用途 |
| --- | --- |
| `GET /api/instrument/{instrument}/getChartBarsByEndTimeAndBarNumber/{periodType}/{barNumber}` | 回傳指定交易產品及週期的 OHLC K 線。每次最多請求 1,000 根 K 線。 |
| `GET /api/instrument/{instrument}/getLastBar/{periodType}` | 回傳最新的快取 OHLC K 線。 |
| `GET /api/instrument/{instrument}/live-statistics` | 回傳受支援統計週期的 open、high 及 low。 |
| `GET /api/instrument/{instrument}/open-price` | 回傳服務定義的交易產品開市價。 |
| `PUT /api/instrument/{instrument}/tick` | 更新 K 線的 OHLC 數據。操作需要交易商或 FTS Web bearer token。 |

有關請求及回應 schema，請參閱 [Realtime Chart Server API](./openapi)。

## 讀取 K 線

以下請求假設 `/chartCode` 已將 `EURUSD` 合約對應到 `EURUSDUSD`，並讀取 200 根 5 分鐘 K 線。週期類型 `6` 代表 5 分鐘。

```bash
curl "https://chart.example.com/api/instrument/EURUSDUSD/getChartBarsByEndTimeAndBarNumber/6/200"
```

K 線資料在 `symbol` 提供 chart code，並包含以毫秒為單位的 Unix 時間戳及 OHLC 數值：

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

將 `chart.example.com` 替換為目標環境的 Realtime Chart Server 主機。

## 週期類型對應

圖表請求使用 `periodType`，K 線修正請求使用 `scale`。兩個欄位使用相同數值對應：

| 值 | 週期 | 值 | 週期 |
| ---: | --- | ---: | --- |
| `1` | 1 分鐘 | `11` | 2 分鐘 |
| `2` | 1 小時 | `12` | 3 分鐘 |
| `3` | 1 日 | `13` | 4 分鐘 |
| `4` | 1 星期 | `14` | 6 分鐘 |
| `5` | 1 個月 | `15` | 10 分鐘 |
| `6` | 5 分鐘 | `16` | 12 分鐘 |
| `7` | 15 分鐘 | `17` | 20 分鐘 |
| `8` | 30 分鐘 | `18` | 3 小時 |
| `9` | 2 小時 | `19` | 8 小時 |
| `10` | 4 小時 | `20` | 12 小時 |

讀取圖表時使用無效週期類型會回傳 `400 Bad Request`。不同部署可以啟用不同週期類型及資料保留上限，請使用目標環境支援的值。

## 修正 K 線

K 線修正需要交易商或 FTS Web JWT。`date` 格式為 `yyyy-MM-dd HH:mm`，請求路徑使用 chart code。

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

> **警告：** K 線修正會更改市場數據。提交請求前，必須核對環境、chart code、時間戳、週期類型及 OHLC 數值。
