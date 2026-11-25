import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import catalog from '../mcp-catalog.json';
import styles from './McpToolCatalog.module.css';
import {
  toolDescriptions, toolLocales, toolNotes, toolSearchTerms, type ToolLocale,
} from './mcpToolDescriptions';

const copy = {
  en: {
    search: 'Search tools', empty: 'No matching tools.', account: 'Account and history',
    market: 'Market data and analysis', trading: 'Trading', prompts: 'Prompts',
    resources: 'Resources', preview: 'Preview', submit: 'Submit', legacy: 'Legacy',
    trade: 'Approval required', inputs: 'Input schema', outputs: 'Output schema',
    required: 'Required', optional: 'Optional', parameters: 'Parameters',
    version: 'Local release candidate', workflow: 'View workflow',
    either: 'Choose one', all: 'All tools', categories: 'Tool categories',
    compatibility: 'Local compatibility tools', responseExample: 'Example response excerpt',
  },
  'zh-Hant': {
    search: '搜尋工具', empty: '找不到符合的工具。', account: '帳戶及交易紀錄',
    market: '市場數據及分析', trading: '交易', prompts: '提示範本',
    resources: '資源', preview: '預覽', submit: '提交', legacy: '舊版',
    trade: '須確認', inputs: '輸入結構', outputs: '輸出結構',
    required: '必填', optional: '選填', parameters: '參數',
    version: '本機發佈候選版本', workflow: '查看交易流程',
    either: '二選一', all: '全部工具', categories: '工具分類',
    compatibility: '本機相容工具', responseExample: '回應範例節錄',
  },
  'zh-Hans': {
    search: '搜索工具', empty: '未找到符合的工具。', account: '账户和交易记录',
    market: '市场数据和分析', trading: '交易', prompts: '提示模板',
    resources: '资源', preview: '预览', submit: '提交', legacy: '旧版',
    trade: '须确认', inputs: '输入结构', outputs: '输出结构',
    required: '必填', optional: '选填', parameters: '参数',
    version: '本地发布候选版本', workflow: '查看交易流程',
    either: '二选一', all: '全部工具', categories: '工具分类',
    compatibility: '本地兼容工具', responseExample: '响应示例节选',
  },
};

const groups = ['account', 'market', 'trading'] as const;
const marketTools = new Set([
  'get_contract_settings', 'get_latest_quote', 'get_historical_bars', 'get_trading_hours',
  'get_market_status', 'analyze_indicators', 'open_candle_chart',
  'get_contract_setting', 'get_chart_codes', 'get_chart_instruments',
  'get_chart_live_statistics', 'get_chart_open_price', 'get_latest_chart_bar',
]);
const legacyTools = new Set([
  'submit_market_order', 'submit_pending_order',
  'prepare_market_order', 'execute_market_order', 'prepare_pending_order', 'execute_pending_order',
  'prepare_edit_order', 'execute_edit_order',
  'prepare_cancel_order', 'execute_cancel_order', 'prepare_liquidation', 'execute_liquidation',
  'prepare_position_protection', 'execute_position_protection',
]);
const responseExamples: Record<string, unknown> = {
  get_latest_quote: {
    contract: 'USDJPY',
    bid: 149.5,
    ask: 149.51,
    freshness: {status: 'FRESH'},
  },
};
const tradeWorkflows: Record<string, string> = {
  submit_order: 'market-order-workflow',
  edit_pending_order: 'edit-pending-order',
  cancel_pending_order: 'cancel-pending-order',
  close_position: 'close-position',
  set_position_protection: 'set-position-protection',
};
const tradingOrder = [...Object.keys(tradeWorkflows), 'get_execution_status', ...legacyTools];
const tradingRank = new Map(tradingOrder.map((name, index) => [name, index]));

function groupFor(tool: (typeof catalog.tools)[number]): (typeof groups)[number] {
  if (!tool.annotations.readOnlyHint || tool.name.startsWith('prepare_')
      || tool.name === 'get_execution_status') {
    return 'trading';
  }
  return marketTools.has(tool.name) ? 'market' : 'account';
}

type InputSchema = {
  $defs?: Record<string, InputSchema | undefined>;
  $ref?: string;
  type?: string;
  description?: string;
  properties?: Record<string, InputSchema | undefined>;
  required?: string[];
  oneOf?: InputSchema[];
  anyOf?: InputSchema[];
  const?: string;
};

function schemaType(schema: InputSchema): string {
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.type) return schema.type;
  if (schema.anyOf) return schema.anyOf.map(schemaType).join(' | ');
  if (schema.$ref) return schema.$ref.split('/').pop() ?? 'object';
  return 'object';
}

function resolveSchema(schema: InputSchema, field: InputSchema): InputSchema {
  const name = field.$ref?.split('/').pop();
  return (name && schema.$defs?.[name]) || field;
}

function Parameters({schema, labels, toolName}: {
  schema: InputSchema;
  labels: (typeof copy)['en'];
  toolName: string;
}) {
  const request = schema.properties?.request;
  const forms = request?.oneOf?.map(variant => resolveSchema(schema, variant))
    ?? [request ? resolveSchema(schema, request) : schema];
  if (!forms.some(form => Object.keys(form.properties ?? {}).length)) return null;
  return (
    <div className={styles.parameters}>
      {forms.map(form => {
        const action = form.properties?.action?.const;
        const title = action === 'preview' ? labels.preview
          : action === 'submit' ? labels.submit : labels.parameters;
        return (
          <div key={action ?? 'parameters'}>
            <p className={styles.parameterTitle}>
              {title}{action && <> <code>action={action}</code></>}
            </p>
            <ul className={styles.parameterList}>
              {Object.entries(form.properties ?? {}).map(([name, property]) => {
                if (!property || (action && name === 'action')) return null;
                const requirement = toolName === 'get_execution_status' ? labels.either
                  : form.required?.includes(name) ? labels.required : labels.optional;
                return (
                  <li className={styles.parameter} key={name}>
                    <code>{name}</code>
                    <span>{schemaType(property)} · {requirement}</span>
                    {property.description && <span>{property.description}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function ToolRow({tool, labels, locale}: {
  tool: (typeof catalog.tools)[number];
  labels: (typeof copy)['en'];
  locale: ToolLocale;
}) {
  const [expanded, setExpanded] = useState(false);
  const badge = legacyTools.has(tool.name) ? labels.legacy
    : tool.annotations.readOnlyHint ? undefined : labels.trade;
  const description = toolDescriptions[tool.name]?.[locale] ?? tool.name;
  const note = toolNotes[tool.name]?.[locale];
  const workflow = tradeWorkflows[tool.name];
  const example = responseExamples[tool.name];
  return (
    <details className={styles.tool} onToggle={event => setExpanded(event.currentTarget.open)}>
      <summary>
        <code>{tool.name}</code>
        {badge && <span className={styles.permission}>{badge}</span>}
        <span className={styles.description}>{description}</span>
      </summary>
      {expanded && (
        <div className={styles.details}>
          {note && <p>{note}</p>}
          {workflow && (
            <p><Link to={`/docs/mcp/trading#${workflow}`}>{labels.workflow}</Link></p>
          )}
          <Parameters schema={tool.inputSchema as InputSchema} labels={labels} toolName={tool.name} />
          {example !== undefined && (
            <details>
              <summary>{labels.responseExample}</summary>
              <pre>{JSON.stringify(example, null, 2)}</pre>
            </details>
          )}
          <details>
            <summary>{labels.inputs}</summary>
            <pre>{JSON.stringify(tool.inputSchema, null, 2)}</pre>
          </details>
          <details>
            <summary>{labels.outputs}</summary>
            <pre>{JSON.stringify(tool.outputSchema, null, 2)}</pre>
          </details>
        </div>
      )}
    </details>
  );
}

export default function McpToolCatalog(): React.JSX.Element {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const locale = currentLocale === 'zh-Hant' || currentLocale === 'zh-Hans' ? currentLocale : 'en';
  const labels = copy[locale];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof groups)[number] | 'all'>('all');
  const isSearching = query.trim().length > 0;
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  const matching = catalog.tools.filter(tool => {
    if (category !== 'all' && groupFor(tool) !== category) return false;
    const descriptions = toolDescriptions[tool.name];
    const localized = toolLocales.map(language => descriptions?.[language]).join(' ');
    const text = [
      tool.name, tool.description, localized, labels[groupFor(tool)], toolSearchTerms[tool.name],
    ].join(' ').toLowerCase();
    return searchTerms.every(term => text.includes(term));
  });

  return (
    <div className={styles.catalog}>
      <label className={styles.search}>
        {labels.search}
        <input type="search" value={query} onChange={event => setQuery(event.currentTarget.value)} />
      </label>
      <div className={styles.categories} role="group" aria-label={labels.categories}>
        {(['all', ...groups] as const).map(group => (
          <button key={group} type="button" aria-pressed={category === group}
            onClick={() => setCategory(group)}>
            {labels[group]}
          </button>
        ))}
      </div>
      <p className={styles.version}>{labels.version} · {catalog.version} · {catalog.transport}</p>
      {matching.length === 0 && <p role="status">{labels.empty}</p>}
      {groups.map(group => {
        const tools = matching.filter(tool => groupFor(tool) === group);
        if (group === 'trading') {
          tools.sort((a, b) => (tradingRank.get(a.name) ?? Infinity)
            - (tradingRank.get(b.name) ?? Infinity));
        }
        return tools.length > 0 && (
          <section key={group}>
            <h2>{labels[group]}</h2>
            {tools.filter(tool => !legacyTools.has(tool.name)).map(tool => (
              <ToolRow key={tool.name} tool={tool} labels={labels} locale={locale} />
            ))}
            {tools.some(tool => legacyTools.has(tool.name)) && (
              <details className={styles.compatibility} open={isSearching} key={String(isSearching)}>
                <summary>{labels.compatibility}</summary>
                {tools.filter(tool => legacyTools.has(tool.name)).map(tool => (
                  <ToolRow key={tool.name} tool={tool} labels={labels} locale={locale} />
                ))}
              </details>
            )}
          </section>
        );
      })}
      {!isSearching && category === 'all' && (
      <>
      <section>
        <h2>{labels.prompts}</h2>
        <dl>{catalog.prompts.map(prompt => (
          <React.Fragment key={prompt.name}>
            <dt><code>{prompt.name}</code></dt>
            <dd>{prompt.description}</dd>
          </React.Fragment>
        ))}</dl>
      </section>
      <section>
        <h2>{labels.resources}</h2>
        <dl>{catalog.resources.map(resource => (
          <React.Fragment key={resource.uri}>
            <dt><code>{resource.uri}</code></dt>
            <dd>{resource.description}</dd>
          </React.Fragment>
        ))}</dl>
      </section>
      </>
      )}
    </div>
  );
}
