import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './McpHostStatus.module.css';

const copy = {
  en: {
    client: 'AI client',
    setup: 'Configuration',
    read: 'Account and quote',
    trade: 'Trade approval',
    checked: 'Checked offline',
    pending: 'Pending acceptance',
    unverified: 'Unverified',
    earlier: 'Earlier demo only',
    readOnly: 'Read-only setup',
    notes: 'This table covers the local Windows candidate. Codex CLI demo evidence applies to source revision',
  },
  'zh-Hant': {
    client: 'AI 用戶端',
    setup: '設定',
    read: '帳戶及報價',
    trade: '交易確認',
    checked: '已離線檢查',
    pending: '待驗收',
    unverified: '未驗證',
    earlier: '僅較早版本的模擬帳戶',
    readOnly: '唯讀設定',
    notes: '此表適用於 Windows 本機候選版本。Codex CLI 的模擬交易證據來自較早的原始碼版本',
  },
  'zh-Hans': {
    client: 'AI 客户端',
    setup: '配置',
    read: '账户及报价',
    trade: '交易确认',
    checked: '已离线检查',
    pending: '待验收',
    unverified: '未验证',
    earlier: '仅较早版本的模拟账户',
    readOnly: '只读设置',
    notes: '此表适用于 Windows 本地候选版本。Codex CLI 的模拟交易证据来自较早的源代码版本',
  },
};

const hosts = [
  ['Codex Desktop', 'pending', 'pending'],
  ['Codex CLI', 'earlier', 'earlier'],
  ['Claude Code', 'unverified', 'unverified'],
  ['Cursor', 'unverified', 'unverified'],
  ['Claude Desktop', 'unverified', 'unverified'],
  ['OpenClaw', 'unverified', 'readOnly'],
  ['Hermes Agent', 'unverified', 'readOnly'],
] as const;

export default function McpHostStatus(): React.JSX.Element {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const locale = currentLocale === 'zh-Hant' || currentLocale === 'zh-Hans' ? currentLocale : 'en';
  const labels = copy[locale];

  return (
    <>
      <p>{labels.notes} <code>652e576</code>{locale === 'en' ? '.' : '。'}</p>
      <table className={styles.table} aria-labelledby="mcp-host-status">
        <thead>
          <tr>
            <th scope="col">{labels.client}</th>
            <th scope="col">{labels.setup}</th>
            <th scope="col">{labels.read}</th>
            <th scope="col">{labels.trade}</th>
          </tr>
        </thead>
        <tbody>
          {hosts.map(([name, read, trade]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{labels.checked}</td>
              <td>{labels[read]}</td>
              <td>{labels[trade]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
