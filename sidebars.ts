import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {apiServices} from './api-services';

const navigationFile = resolve(__dirname, 'src/generated/api-navigation.json');
const apiNavigation = existsSync(navigationFile)
  ? JSON.parse(readFileSync(navigationFile, 'utf8')) : {};

const sidebars = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Get started',
      collapsed: true,
      items: [
        'getting-started/first-trade',
        'getting-started/get-prices',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: true,
      link: {type: 'doc', id: 'guides'},
      items: [
        'realtime-chart-server/overview',
        'fx-server/general-rest-api-information',
        'fx-server/price-steaming',
      ],
    },
    {
      type: 'category',
      label: 'MCP',
      items: [
        'getting-started/connect-your-ai',
      ],
    },
    {
      type: 'category',
      label: 'API reference',
      collapsed: true,
      link: {type: 'doc', id: 'api-reference'},
      items: [
        ...apiServices.map(service => ({
          type: 'category' as const,
          label: service.label,
          collapsed: true,
          link: {type: 'doc' as const, id: service.overview},
          items: apiNavigation[service.specId]?.groups ?? [],
        })),
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'business-logic/contract-overview',
        'business-logic/currency-overview',
        'business-logic/price-concept',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        {
          type: 'link',
          label: 'Trader API Client Starter Kit',
          href: 'https://github.com/mF-Technologies/trader-api-client-starter-kit',
        },
      ],
    },
  ],
} satisfies SidebarsConfig;

export default sidebars;
