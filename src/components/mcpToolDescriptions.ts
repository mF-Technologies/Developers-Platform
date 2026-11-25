export const toolLocales = ['en', 'zh-Hant', 'zh-Hans'] as const;
export type ToolLocale = (typeof toolLocales)[number];

type LocalizedDescription = Record<ToolLocale, string>;

export const toolDescriptions: Record<string, LocalizedDescription> = {
  get_account_balance: {
    en: 'Get current account balance, equity and margin.',
    'zh-Hant': '查詢目前帳戶餘額、淨值及保證金。',
    'zh-Hans': '查询当前账户余额、净值及保证金。',
  },
  get_account_currencies: {
    en: 'Get the account’s display and settlement currencies.',
    'zh-Hant': '查詢帳戶的顯示及結算幣別。',
    'zh-Hans': '查询账户的显示及结算币种。',
  },
  get_contract_setting: {
    en: 'Get the trading settings for one exact contract.',
    'zh-Hant': '查詢指定合約的交易設定。',
    'zh-Hans': '查询指定合约的交易设置。',
  },
  get_cash_movements: {
    en: 'List cash movements over a report date range.',
    'zh-Hant': '按報表日期查詢資金變動。',
    'zh-Hans': '按报表日期查询资金变动。',
  },
  get_statement_summary: {
    en: 'Get statement totals for a report date range.',
    'zh-Hant': '查詢指定日期範圍的結單總額。',
    'zh-Hans': '查询指定日期范围的账单总额。',
  },
  get_report_open_positions: {
    en: 'List open positions reported for an end date.',
    'zh-Hant': '查詢截至指定日期的報表持倉。',
    'zh-Hans': '查询截至指定日期的报表持仓。',
  },
  get_last_trade_streak: {
    en: 'Get the last reported consecutive trade count and P&L.',
    'zh-Hant': '查看最近一段連續交易的筆數及損益。',
    'zh-Hans': '查看最近一段连续交易的笔数及盈亏。',
  },
  get_today_liquidations: {
    en: 'List position closures for the broker’s current trading day.',
    'zh-Hant': '查詢交易商當前交易日的平倉紀錄。',
    'zh-Hans': '查询交易商当前交易日的平仓记录。',
  },
  get_liquidation_detail: {
    en: 'Get a position closure by liquidation reference.',
    'zh-Hant': '按平倉編號查看詳情。',
    'zh-Hans': '按平仓编号查看详情。',
  },
  get_chart_codes: {
    en: 'List the contract-to-chart mappings from FxServer.',
    'zh-Hant': '列出 FxServer 的合約與圖表代碼對照。',
    'zh-Hans': '列出 FxServer 的合约与图表代码对照。',
  },
  get_chart_instruments: {
    en: 'List the contract-to-instrument mappings from Chart Server.',
    'zh-Hant': '列出 Chart Server 的合約與圖表代碼對照。',
    'zh-Hans': '列出 Chart Server 的合约与图表代码对照。',
  },
  get_chart_live_statistics: {
    en: 'Get reported open, high and low prices by time window.',
    'zh-Hant': '按時間範圍查看開市、最高及最低價格。',
    'zh-Hans': '按时间范围查看开市、最高及最低价格。',
  },
  get_chart_open_price: {
    en: 'Get the open price reported by Chart Server.',
    'zh-Hant': '查看 Chart Server 回報的開市價。',
    'zh-Hans': '查看 Chart Server 返回的开市价。',
  },
  get_latest_chart_bar: {
    en: 'Get the latest cached candle, which may still be forming.',
    'zh-Hant': '查看快取中最新的 K 線，該 K 線可能尚未完成。',
    'zh-Hans': '查看缓存中最新的 K 线，该 K 线可能尚未完成。',
  },
  wait_for_position_update: {
    en: 'Wait briefly for a position update, then reread account state.',
    'zh-Hant': '短時間等待一項持倉更新，再查詢帳戶狀態。',
    'zh-Hans': '短时间等待一项持仓更新，再查询账户状态。',
  },
  estimate_trade_risk: {
    en: 'Estimate a Forex trade’s loss at its stop price or size it from a risk budget.',
    'zh-Hant': '估算外匯交易觸及止蝕價時的損失，或按風險預算估算交易數量。',
    'zh-Hans': '估算外汇交易触及止损价时的损失，或按风险预算估算交易数量。',
  },
  get_account_review: {
    en: 'Review balances, margin, positions and orders with the freshness and completeness of each source.',
    'zh-Hant': '查看餘額、保證金、持倉及訂單，以及各項資料的時間和完整性。',
    'zh-Hans': '查看余额、保证金、持仓及订单，以及各项数据的时间和完整性。',
  },
  get_account_snapshot: {
    en: 'Get your balance, open positions and orders together.',
    'zh-Hant': '一次查看帳戶餘額、未平倉持倉及訂單。',
    'zh-Hans': '一次查看账户余额、未平仓持仓及订单。',
  },
  get_deal_history: {
    en: 'Get completed position closures for a date range.',
    'zh-Hant': '按日期範圍查詢已完成的平倉紀錄。',
    'zh-Hans': '按日期范围查询已完成的平仓记录。',
  },
  get_open_positions: {
    en: 'List current open positions.',
    'zh-Hant': '列出目前未平倉的持倉。',
    'zh-Hans': '列出当前未平仓的持仓。',
  },
  get_order_detail: {
    en: 'Look up one order by its order reference.',
    'zh-Hant': '按訂單編號查看一張訂單的詳情。',
    'zh-Hans': '按订单编号查看一笔订单的详情。',
  },
  get_order_history: {
    en: 'Get executed orders for a date range.',
    'zh-Hant': '按日期範圍查詢已執行的訂單。',
    'zh-Hans': '按日期范围查询已执行的订单。',
  },
  get_position_detail: {
    en: 'Look up one open position by its reference.',
    'zh-Hant': '按持倉編號查看一筆未平倉持倉的詳情。',
    'zh-Hans': '按持仓编号查看一笔未平仓持仓的详情。',
  },
  get_risk_summary: {
    en: 'Review account margin and exposure grouped by contract.',
    'zh-Hant': '查看帳戶保證金及按合約分類的風險承擔。',
    'zh-Hans': '查看账户保证金及按合约分类的风险敞口。',
  },
  get_working_orders: {
    en: 'Check working, executed and cancelled orders in the current account.',
    'zh-Hant': '查看目前帳戶的掛單、已執行及已取消訂單。',
    'zh-Hans': '查看当前账户的挂单、已执行及已取消订单。',
  },
  review_activity: {
    en: 'Review executed orders and position closures for a specified date range.',
    'zh-Hant': '按指定日期範圍檢視已執行訂單和平倉紀錄。',
    'zh-Hans': '按指定日期范围查看已执行订单和平仓记录。',
  },
  analyze_indicators: {
    en: 'Calculate RSI and moving averages from completed candles.',
    'zh-Hant': '用已完成的 K 線計算 RSI 及移動平均線。',
    'zh-Hans': '用已完成的 K 线计算 RSI 和移动平均线。',
  },
  get_contract_settings: {
    en: 'Check which contracts are available and their trading size rules.',
    'zh-Hant': '查看可交易的合約及其交易數量規則。',
    'zh-Hans': '查看可交易的合约及其交易数量规则。',
  },
  get_historical_bars: {
    en: 'Get completed historical candles for a contract and time interval.',
    'zh-Hant': '按合約及時間週期取得已完成的歷史 K 線。',
    'zh-Hans': '按合约及时间周期获取已完成的历史 K 线。',
  },
  get_latest_quote: {
    en: 'Get the latest bid and ask for a contract and check how recent the quote is.',
    'zh-Hant': '取得合約的最新買入價、賣出價及報價時間。',
    'zh-Hans': '获取合约的最新买入价、卖出价及报价时间。',
  },
  get_market_status: {
    en: 'Check quote and candle freshness alongside the available session schedule.',
    'zh-Hant': '查看交易時段，以及報價和 K 線是否為最新資料。',
    'zh-Hans': '查看交易时段，以及报价和 K 线是否为最新数据。',
  },
  get_trading_hours: {
    en: 'Get the contract’s weekly trading schedule.',
    'zh-Hant': '查看合約每週的交易時段。',
    'zh-Hans': '查看合约每周的交易时段。',
  },
  open_candle_chart: {
    en: 'Open a chart of completed candles in your local browser.',
    'zh-Hant': '在本機瀏覽器開啟已完成的 K 線圖。',
    'zh-Hans': '在本地浏览器打开已完成的 K 线图。',
  },
  submit_order: {
    en: 'Preview and submit a new market, limit or stop order.',
    'zh-Hant': '預覽及提交新市價單、限價單或止損掛單。',
    'zh-Hans': '预览及提交新市价单、限价单或止损挂单。',
  },
  cancel_pending_order: {
    en: 'Preview cancellation of a working order, then open the approval form.',
    'zh-Hant': '預覽取消現有掛單，再開啟確認表單。',
    'zh-Hans': '预览取消现有挂单，再打开确认表单。',
  },
  close_position: {
    en: 'Preview a partial or full close of an open position.',
    'zh-Hant': '預覽部分或全數平倉。',
    'zh-Hans': '预览部分或全部平仓。',
  },
  set_position_protection: {
    en: 'Preview and set a complete stop-loss and take-profit pair on a position.',
    'zh-Hant': '預覽及設定持倉的完整止損及止盈配對。',
    'zh-Hans': '预览及设置持仓的完整止损和止盈配对。',
  },
  submit_market_order: {
    en: 'Preview a market order, then open the approval form using the returned client order ID.',
    'zh-Hant': '預覽市價單，再用回傳的 client order ID 開啟確認表單。',
    'zh-Hans': '预览市价单，再用返回的 client order ID 打开确认表单。',
  },
  submit_pending_order: {
    en: 'Preview a new limit or stop order, then open its approval form.',
    'zh-Hant': '預覽新限價單或止損掛單，再開啟確認表單。',
    'zh-Hans': '预览新限价单或止损挂单，再打开确认表单。',
  },
  edit_pending_order: {
    en: 'Preview changes to a working order, then open the approval form.',
    'zh-Hant': '預覽現有掛單的修改，再開啟確認表單。',
    'zh-Hans': '预览现有挂单的修改，再打开确认表单。',
  },
  get_execution_status: {
    en: 'Check the result of an earlier trade request without submitting it again.',
    'zh-Hant': '查詢原交易請求的結果，避免重複提交。',
    'zh-Hans': '查询原交易请求的结果，避免重复提交。',
  },
  prepare_market_order: {
    en: 'Preview a market order for clients using the earlier two-tool workflow.',
    'zh-Hant': '為仍使用舊版兩工具流程的客戶端預覽市價單。',
    'zh-Hans': '为仍使用旧版两工具流程的客户端预览市价单。',
  },
  execute_market_order: {
    en: 'Submit a market order prepared through the earlier two-tool workflow after approval.',
    'zh-Hant': '經確認後，提交以舊版兩工具流程預覽的市價單。',
    'zh-Hans': '经确认后，提交以旧版两工具流程预览的市价单。',
  },
  prepare_pending_order: {
    en: 'Preview the price, expiry and protection of a new limit or stop order.',
    'zh-Hant': '預覽新限價單或止損掛單的價格、有效期及保護條款。',
    'zh-Hans': '预览新限价单或止损挂单的价格、有效期及保护条款。',
  },
  execute_pending_order: {
    en: 'Submit a prepared limit or stop order after approval.',
    'zh-Hant': '經確認後，提交已預覽的限價單或止損掛單。',
    'zh-Hans': '经确认后，提交已预览的限价单或止损挂单。',
  },
  prepare_edit_order: {
    en: 'Preview changes to an existing pending order.',
    'zh-Hant': '預覽對現有掛單的修改。',
    'zh-Hans': '预览对现有挂单的修改。',
  },
  execute_edit_order: {
    en: 'Apply the prepared changes to a pending order after approval.',
    'zh-Hant': '經確認後，套用已預覽的掛單修改。',
    'zh-Hans': '经确认后，应用已预览的挂单修改。',
  },
  prepare_cancel_order: {
    en: 'Preview cancellation of a working order.',
    'zh-Hant': '預覽即將取消的掛單。',
    'zh-Hans': '预览即将取消的挂单。',
  },
  execute_cancel_order: {
    en: 'Cancel the selected working order after approval.',
    'zh-Hant': '經確認後，取消指定掛單。',
    'zh-Hans': '经确认后，取消指定挂单。',
  },
  prepare_liquidation: {
    en: 'Preview a full or partial position close and the expected remaining size.',
    'zh-Hant': '預覽全部或部分平倉，以及預計剩餘的持倉數量。',
    'zh-Hans': '预览全部或部分平仓，以及预计剩余的持仓数量。',
  },
  execute_liquidation: {
    en: 'Close all or part of the selected position after approval.',
    'zh-Hant': '經確認後，全部或部分平倉。',
    'zh-Hans': '经确认后，全部或部分平仓。',
  },
  prepare_position_protection: {
    en: 'Preview take-profit and stop-loss settings for an open position.',
    'zh-Hant': '預覽未平倉持倉的止盈及止蝕設定。',
    'zh-Hans': '预览未平仓持仓的止盈和止损设置。',
  },
  execute_position_protection: {
    en: 'Set the reviewed take-profit and stop-loss on an open position after approval.',
    'zh-Hant': '經確認後，為未平倉持倉設定已預覽的止盈和止蝕。',
    'zh-Hans': '经确认后，为未平仓持仓设置已预览的止盈和止损。',
  },
};

export const toolNotes: Record<string, LocalizedDescription> = {
  wait_for_position_update: {
    en: 'Returns affected position references for one notification. If no event is observed, refresh account state to check for changes.',
    'zh-Hant': '回傳一項通知涉及的持倉編號。如未觀察到通知，可重新查詢帳戶狀態。',
    'zh-Hans': '返回一项通知涉及的持仓编号。如未观察到通知，可重新查询账户状态。',
  },
  get_latest_chart_bar: {
    en: 'Use historical bars for completed candles. This tool reads the latest cached candle.',
    'zh-Hant': '此工具讀取最新快取 K 線。查詢已完成 K 線時請使用歷史 K 線工具。',
    'zh-Hans': '此工具读取最新缓存 K 线。查询已完成 K 线时请使用历史 K 线工具。',
  },
  estimate_trade_risk: {
    en: 'For supported Forex contracts. Enter an amount in contract units, a risk budget with its currency, or both. The tool needs a fresh quote. Actual losses can differ.',
    'zh-Hant': '適用於指定外匯合約。可輸入合約單位數量、風險預算及其幣別，或同時提供兩者。估算需要近期報價，實際損失可能不同。',
    'zh-Hans': '适用于指定外汇合约。可输入合约单位数量、风险预算及其币种，或同时提供两者。估算需要近期报价，实际损失可能不同。',
  },
  get_execution_status: {
    en: 'Use the client order ID returned by the preview. Cancellation and legacy two-tool workflows use the original intent ID.',
    'zh-Hant': '使用預覽回傳的 client order ID。撤單及舊版兩工具流程使用原本的 intent ID。',
    'zh-Hans': '使用预览返回的 client order ID。撤单及旧版两工具流程使用原来的 intent ID。',
  },
};

export const toolSearchTerms: Record<string, string> = {
  submit_order: '落單 下單 落单 下单 掛單 挂单',
  cancel_pending_order: '撤單 撤单 取消',
  close_position: '平倉 平仓',
  set_position_protection: '止盈 止損 止损 TP SL',
  submit_market_order: '落單 下單 落单 下单',
  submit_pending_order: '落單 下單 落单 下单 掛單 挂单',
  edit_pending_order: '改單 改单',
  prepare_pending_order: '落單 下單 落单 下单',
  prepare_edit_order: '改單 改单',
  execute_edit_order: '改單 改单',
  prepare_cancel_order: '撤單 撤单',
  execute_cancel_order: '撤單 撤单',
};
