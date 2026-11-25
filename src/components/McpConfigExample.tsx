import React from 'react';
import CodeBlock from '@theme/CodeBlock';

const launchArgs = [
  ['--no-config', '--no-env-file', '--managed-python'],
  ['--python', '3.12', '--index', '<DEPENDENCY_INDEX_URL>'],
  ['--default-index', 'https://pypi.org/simple'],
  ['--index-strategy', 'first-index', '--from', '<WHEEL_SOURCE>'],
  ['trader-api-mcp', '--env-file', '<ACCOUNT_FILE>', '--read-only'],
];

const stdioExample = {
  command: '<UVX_PATH>',
  args: launchArgs.flat(),
};

const jsonExamples = {
  'claude-code': {mcpServers: {'mft-trader-api': {...stdioExample, type: 'stdio'}}},
  cursor: {mcpServers: {'mft-trader-api': {...stdioExample, type: 'stdio'}}},
  'claude-desktop': {mcpServers: {'mft-trader-api': stdioExample}},
  openclaw: {
    mcp: {
      servers: {
        'mft-trader-api': {
          ...stdioExample,
          transport: 'stdio',
          connectionTimeoutMs: 120000,
          requestTimeoutMs: 120000,
        },
      },
    },
  },
  hermes: {
    mcp_servers: {
      'mft-trader-api': {
        ...stdioExample,
        connect_timeout: 120,
        timeout: 120,
        trust: 'untrusted',
      },
    },
  },
};

const codexExample = [
  '[mcp_servers.mft-trader-api]',
  `command = ${JSON.stringify(stdioExample.command)}`,
  'args = [',
  ...launchArgs.map((line) => `  ${line.map((value) => JSON.stringify(value)).join(', ')},`),
  ']',
  'startup_timeout_sec = 120',
].join('\n');

type Props = {
  host: 'codex' | keyof typeof jsonExamples;
};

const configFiles: Record<Props['host'], string> = {
  codex: 'config.toml',
  'claude-code': '.mcp.json',
  cursor: 'mcp.json',
  'claude-desktop': 'claude_desktop_config.json',
  openclaw: 'openclaw.json',
  hermes: 'config.yaml',
};

export default function McpConfigExample({host}: Props): React.JSX.Element {
  const config = host === 'codex' ? codexExample : JSON.stringify(jsonExamples[host], null, 2);

  return (
    <CodeBlock className="mcpConfigExample" language={host === 'codex' ? 'text' : 'json'} title={configFiles[host]}>
      {config}
    </CodeBlock>
  );
}
