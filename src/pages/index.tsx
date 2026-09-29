import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

type SupportedLocale = 'en' | 'zh-Hant' | 'zh-Hans';

type JourneyStep = {
  number: string;
  label: string;
  title: string;
  copy: string;
  meta: string;
};

type HomeCopy = {
  title: string;
  description: string;
  hero: {
    firstLine: string;
    secondLine: string;
    body: string;
    primaryAction: string;
    secondaryAction: string;
    examplesAction: string;
    request: string;
    requestLabel: string;
    environment: string;
    accepted: string;
    orbit: string;
    signals: string[];
    capabilitiesLabel: string;
  };
  journey: {
    eyebrow: string;
    titleFirstLine: string;
    titleSecondLine: string;
    body: string;
    steps: JourneyStep[];
  };
  surfaces: {
    eyebrow: string;
    titleFirstLine: string;
    titleSecondLine: string;
    openReference: string;
    readGuide: string;
    webProxyTag: string;
    webProxyBody: string;
    fxServerTag: string;
    fxServerBody: string;
    chartServerTag: string;
    chartServerBody: string;
  };
  concepts: {
    eyebrow: string;
    titleFirstLine: string;
    titleSecondLine: string;
    action: string;
    contracts: string;
    contractsBody: string;
    currencies: string;
    currenciesBody: string;
    prices: string;
    pricesBody: string;
  };
};

const homeCopy: Record<SupportedLocale, HomeCopy> = {
  en: {
    title: 'mF Technologies Developer Platform',
    description:
      'Developer onboarding and API reference for the Trader OpenAPI platform by mF Technologies.',
    hero: {
      firstLine: 'From access',
      secondLine: 'to execution.',
      body: 'The complete onboarding path for developers building secure, observable trading experiences on FxServer, WebProxy, and Realtime Chart Server.',
      primaryAction: 'Make your first trade',
      secondaryAction: 'Explore the API',
      examplesAction: 'Open Trader API Client Starter Kit',
      request: 'REQUEST',
      requestLabel: 'Example Trader API request',
      environment: 'TEST ENV',
      accepted: 'Deal accepted',
      orbit: 'AUTH / CONFIG / TRADE / STREAM',
      signals: [
        'JWT access',
        'Market + quoted modes',
        'Duplicate protection',
        'Live execution events',
      ],
      capabilitiesLabel: 'Platform capabilities',
    },
    journey: {
      eyebrow: 'THE INTEGRATION ROUTE',
      titleFirstLine: 'One clear path.',
      titleSecondLine: 'No missing steps.',
      body: 'Everything required to move from credentials to a reconciled trade.',
      steps: [
        {number: '01', label: 'Establish trust', title: 'Authenticate', copy: 'Create a WebProxy session, issue an API key, then exchange it for a short-lived access token.', meta: 'WebProxy'},
        {number: '02', label: 'Know the instrument', title: 'Discover', copy: 'Load account and contract settings before calculating amount, margin, or available actions.', meta: 'WebProxy'},
        {number: '03', label: 'Make it idempotent', title: 'Execute', copy: 'Place a market or quoted deal with an intentional price mode and a unique client order ID.', meta: 'FxServer'},
        {number: '04', label: 'Follow the lifecycle', title: 'Reconcile', copy: 'Consume server-sent events and handle delayed, manual, or hedge processing without guessing.', meta: 'SSE'},
      ],
    },
    surfaces: {
      eyebrow: 'THE API SURFACE',
      titleFirstLine: 'Three services.',
      titleSecondLine: 'One connected platform.',
      openReference: 'Open reference',
      readGuide: 'Read the guide',
      webProxyTag: 'IDENTITY + CONTEXT',
      webProxyBody: 'Sessions, API keys, accounts, contract settings, statements, and history.',
      fxServerTag: 'EXECUTION + STATE',
      fxServerBody: 'Orders, deals, liquidation, balances, positions, and server-sent updates.',
      chartServerTag: 'MARKET DATA + BARS',
      chartServerBody: 'Instrument mapping, OHLC history, latest bars, open prices, and live market statistics.',
    },
    concepts: {
      eyebrow: 'READ THE MARKET MODEL',
      titleFirstLine: 'Trading vocabulary,',
      titleSecondLine: 'made operational.',
      action: 'Read REST essentials',
      contracts: 'Contracts',
      contractsBody: 'Instruments, lot size, and currency pairs',
      currencies: 'Currencies',
      currenciesBody: 'Base, counter, system, and settlement',
      prices: 'Prices',
      pricesBody: 'Quotes, tags, validation, and execution',
    },
  },
  'zh-Hant': {
    title: 'mF Technologies 開發者平台',
    description: 'mF Technologies Trader OpenAPI 平台的開發者入門指南及 API 參考文件。',
    hero: {
      firstLine: '由接入，', secondLine: '到執行。',
      body: '從身份驗證到交易執行，一次掌握 FxServer、WebProxy 及 Realtime Chart Server 的完整整合流程。',
      primaryAction: '完成第一筆交易', secondaryAction: '查看 API', examplesAction: '開啟 Trader API Client Starter Kit', request: '請求',
      requestLabel: 'Trader API 請求範例',
      environment: '測試環境', accepted: '交易已接受', orbit: '驗證 / 設定 / 交易 / 串流',
      signals: ['JWT 存取', '市價 + 報價模式', '重複請求保護', '即時執行事件'],
      capabilitiesLabel: '平台功能',
    },
    journey: {
      eyebrow: '整合流程', titleFirstLine: '一條清晰路徑，', titleSecondLine: '沒有遺漏步驟。',
      body: '由憑證開始，直到完成交易對帳。',
      steps: [
        {number: '01', label: '建立信任', title: '身份驗證', copy: '透過 WebProxy 建立 session 及 API key，再交換成短效 access token。', meta: 'WebProxy'},
        {number: '02', label: '了解交易產品', title: '讀取設定', copy: '計算 amount、保證金或可用操作前，先讀取帳戶及合約設定。', meta: 'WebProxy'},
        {number: '03', label: '防止重複請求', title: '執行交易', copy: '選擇合適的價格模式，並以唯一的 clientOrderId 提交交易。', meta: 'FxServer'},
        {number: '04', label: '追蹤完整週期', title: '對帳', copy: '接收 SSE 事件，正確處理延遲、人工或對沖流程。', meta: 'SSE'},
      ],
    },
    surfaces: {
      eyebrow: 'API 服務', titleFirstLine: '三項服務，', titleSecondLine: '連成一個平台。',
      openReference: '開啟參考文件', readGuide: '閱讀指南', webProxyTag: '身份 + 資料',
      webProxyBody: 'Session、API keys、帳戶、合約設定、結單及歷史記錄。',
      fxServerTag: '執行 + 狀態', fxServerBody: '掛單、交易、平倉、餘額、持倉及 SSE 更新。',
      chartServerTag: '市場數據 + K 線', chartServerBody: '產品對應、OHLC 歷史、最新 K 線、開市價及即時市場統計。',
    },
    concepts: {
      eyebrow: '了解市場模型', titleFirstLine: '將交易概念，', titleSecondLine: '變成可執行流程。',
      action: '閱讀 REST 基礎', contracts: '合約', contractsBody: '交易產品、每手合約量及貨幣對',
      currencies: '貨幣', currenciesBody: '基礎、報價、系統及結算貨幣', prices: '價格',
      pricesBody: '報價、priceTag、驗證及交易執行',
    },
  },
  'zh-Hans': {
    title: 'mF Technologies 开发者平台',
    description: 'mF Technologies Trader OpenAPI 平台的开发者入门指南及 API 参考文档。',
    hero: {
      firstLine: '由接入，', secondLine: '到执行。',
      body: '从身份验证到交易执行，一次掌握 FxServer、WebProxy 及 Realtime Chart Server 的完整集成流程。',
      primaryAction: '完成第一笔交易', secondaryAction: '查看 API', examplesAction: '打开 Trader API Client Starter Kit', request: '请求',
      requestLabel: 'Trader API 请求示例',
      environment: '测试环境', accepted: '交易已接受', orbit: '验证 / 设置 / 交易 / 数据流',
      signals: ['JWT 访问', '市价 + 报价模式', '重复请求保护', '实时执行事件'],
      capabilitiesLabel: '平台功能',
    },
    journey: {
      eyebrow: '集成流程', titleFirstLine: '一条清晰路径，', titleSecondLine: '没有遗漏步骤。',
      body: '从凭证开始，直到完成交易对账。',
      steps: [
        {number: '01', label: '建立信任', title: '身份验证', copy: '通过 WebProxy 创建会话及 API key，再交换成短期 access token。', meta: 'WebProxy'},
        {number: '02', label: '了解交易产品', title: '读取设置', copy: '计算 amount、保证金或可用操作前，先读取账户及合约设置。', meta: 'WebProxy'},
        {number: '03', label: '防止重复请求', title: '执行交易', copy: '选择合适的价格模式，并以唯一的 clientOrderId 提交交易。', meta: 'FxServer'},
        {number: '04', label: '跟踪完整周期', title: '对账', copy: '接收 SSE 事件，正确处理延迟、人工或对冲流程。', meta: 'SSE'},
      ],
    },
    surfaces: {
      eyebrow: 'API 服务', titleFirstLine: '三项服务，', titleSecondLine: '连接成一个平台。',
      openReference: '打开参考文档', readGuide: '阅读指南', webProxyTag: '身份 + 数据',
      webProxyBody: '会话、API keys、账户、合约设置、报表及历史记录。',
      fxServerTag: '执行 + 状态', fxServerBody: '挂单、交易、平仓、余额、持仓及 SSE 更新。',
      chartServerTag: '市场数据 + K 线', chartServerBody: '产品映射、OHLC 历史、最新 K 线、开盘价及实时市场统计。',
    },
    concepts: {
      eyebrow: '了解市场模型', titleFirstLine: '将交易概念，', titleSecondLine: '转化为可执行流程。',
      action: '阅读 REST 基础', contracts: '合约', contractsBody: '交易产品、每手合约量及货币对',
      currencies: '货币', currenciesBody: '基础、报价、系统及结算货币', prices: '价格',
      pricesBody: '报价、priceTag、验证及交易执行',
    },
  },
};

function Arrow(): ReactNode {
  return <span aria-hidden="true">-&gt;</span>;
}

function RequestPanel({copy}: {copy: HomeCopy['hero']}): ReactNode {
  return (
    <div className={styles.requestPanel} aria-label={copy.requestLabel}>
      <div className={styles.panelBar}>
        <span className={styles.panelTitle}>{copy.request} / 001</span>
        <span className={styles.liveState}><i /> {copy.environment}</span>
      </div>
      <div className={styles.endpoint}><span>POST</span><code>/addDeal</code></div>
      <pre className={styles.codeBlock}><code>{`{
  "clientOrderId": 10001,
  "priceMode": 1,
  "contractCode": "EURUSD",
  "amount": 1000,
  "buyOrSell": true
}`}</code></pre>
      <div className={styles.responseLine}>
        <span className={styles.statusCode}>200</span><span>{copy.accepted}</span><span className={styles.latency}>84 ms</span>
      </div>
    </div>
  );
}

function HomepageHeader({copy}: {copy: HomeCopy}): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span>MF-TECHNOLOGIES</span><span>V1.0</span></div>
          <h1>{copy.hero.firstLine}<br /><em>{copy.hero.secondLine}</em></h1>
          <p>{copy.hero.body}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} to="/docs/getting-started/first-trade">{copy.hero.primaryAction} <Arrow /></Link>
            <Link className={styles.secondaryAction} to="/docs/fx-server/openapi-trader">{copy.hero.secondaryAction}</Link>
          </div>
          <a
            className={styles.examplesAction}
            href="https://github.com/mF-Technologies/trader-api-client-starter-kit"
            target="_blank"
            rel="noreferrer"
          >
            {copy.hero.examplesAction} <Arrow />
          </a>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualIndex}>01-06</div><RequestPanel copy={copy.hero} />
          <div className={styles.orbitLabel}>{copy.hero.orbit}</div>
        </div>
      </div>
      <div className={styles.signalBar} aria-label={copy.hero.capabilitiesLabel}>
        {copy.hero.signals.map((signal) => <span key={signal}>{signal}</span>)}
      </div>
    </header>
  );
}

function Journey({copy}: {copy: HomeCopy['journey']}): ReactNode {
  return (
    <section className={styles.journey}>
      <div className={styles.sectionHeading}>
        <p>{copy.eyebrow}</p><h2>{copy.titleFirstLine}<br />{copy.titleSecondLine}</h2><span>{copy.body}</span>
      </div>
      <div className={styles.journeyGrid}>
        {copy.steps.map((step) => (
          <article className={styles.journeyCard} key={step.number}>
            <div className={styles.cardTopline}><span>{step.number}</span><span>{step.meta}</span></div>
            <p>{step.label}</p><h3>{step.title}</h3><div className={styles.cardRule} /><span className={styles.cardCopy}>{step.copy}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ApiSurfaces({copy}: {copy: HomeCopy['surfaces']}): ReactNode {
  const surfaces = [
    {number: 'A / 01', tag: copy.webProxyTag, title: 'WebProxy API', body: copy.webProxyBody, footer: copy.openReference, to: '/docs/web-proxy/openapi', className: styles.surfaceCard},
    {number: 'A / 02', tag: copy.fxServerTag, title: 'FxServer Trader', body: copy.fxServerBody, footer: copy.openReference, to: '/docs/fx-server/openapi-trader', className: `${styles.surfaceCard} ${styles.surfaceCardDark}`},
    {number: 'A / 03', tag: copy.chartServerTag, title: 'Realtime Chart Server', body: copy.chartServerBody, footer: copy.readGuide, to: '/docs/realtime-chart-server/overview', className: `${styles.surfaceCard} ${styles.surfaceCardChart}`},
  ];
  return (
    <section className={styles.surfaces}>
      <div className={styles.surfaceIntro}><p>{copy.eyebrow}</p><h2>{copy.titleFirstLine}<br />{copy.titleSecondLine}</h2></div>
      {surfaces.map((surface) => (
        <Link className={surface.className} to={surface.to} key={surface.number}>
          <div className={styles.surfaceNumber}>{surface.number}</div>
          <div><span className={styles.surfaceTag}>{surface.tag}</span><h3>{surface.title}</h3><p>{surface.body}</p></div>
          <div className={styles.surfaceFooter}><span>{surface.footer}</span><Arrow /></div>
        </Link>
      ))}
    </section>
  );
}

function ConceptLinks({copy}: {copy: HomeCopy['concepts']}): ReactNode {
  const concepts = [
    {number: '01', title: copy.contracts, body: copy.contractsBody, to: '/docs/business-logic/contract-overview'},
    {number: '02', title: copy.currencies, body: copy.currenciesBody, to: '/docs/business-logic/currency-overview'},
    {number: '03', title: copy.prices, body: copy.pricesBody, to: '/docs/business-logic/price-concept'},
  ];
  return (
    <section className={styles.concepts}>
      <div className={styles.conceptLead}>
        <p>{copy.eyebrow}</p><h2>{copy.titleFirstLine}<br />{copy.titleSecondLine}</h2>
        <Link to="/docs/fx-server/general-rest-api-information">{copy.action} <Arrow /></Link>
      </div>
      <div className={styles.conceptList}>
        {concepts.map((concept) => (
          <Link to={concept.to} key={concept.number}><span>{concept.number}</span><strong>{concept.title}</strong><small>{concept.body}</small><Arrow /></Link>
        ))}
      </div>
    </section>
  );
}

function getLocale(locale: string): SupportedLocale {
  return locale === 'zh-Hant' || locale === 'zh-Hans' ? locale : 'en';
}

export default function Home(): ReactNode {
  const {i18n} = useDocusaurusContext();
  const locale = getLocale(i18n.currentLocale);
  const copy = homeCopy[locale];

  return (
    <Layout title={copy.title} description={copy.description}>
      <div className={locale === 'en' ? undefined : styles.cjkHome}>
        <HomepageHeader copy={copy} />
        <main className={styles.main}>
          <Journey copy={copy.journey} /><ApiSurfaces copy={copy.surfaces} /><ConceptLinks copy={copy.concepts} />
        </main>
      </div>
    </Layout>
  );
}
