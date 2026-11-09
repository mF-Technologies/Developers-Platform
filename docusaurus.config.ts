import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';
import {apis} from './openapi.config';

const siteUrl = new URL(
  process.env.CI_PAGES_URL ??
    process.env.SITE_URL ??
    'https://developers.m-finance.com',
);
const inferredBaseUrl = `${siteUrl.pathname.replace(/\/$/, '')}/`;

const config: Config = {
  title: 'mF Technologies Developer Platform',
  tagline: 'Developer documentation for Trader OpenAPI',
  favicon: 'img/mf-technologies-mark.svg',

  url: siteUrl.origin,
  baseUrl: process.env.BASE_URL ?? inferredBaseUrl,
  organizationName: 'mF Technologies',
  projectName: 'developers-platform',
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hant', 'zh-Hans'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en'},
      'zh-Hant': {label: '繁體中文', htmlLang: 'zh-Hant'},
      'zh-Hans': {label: '简体中文', htmlLang: 'zh-Hans'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          async sidebarItemsGenerator({defaultSidebarItemsGenerator, ...args}) {
            const items = await defaultSidebarItemsGenerator(args);

            function removeHiddenItems(items: any[]): any[] {
              return items
                .filter((item) => !item.customProps?.hidden)
                .map((item) => item.type === 'category'
                  ? {...item, items: removeHiddenItems(item.items)}
                  : item);
            }

            return removeHiddenItems(items);
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'generated/api',
        routeBasePath: 'api',
        sidebarPath: './api-sidebars.ts',
        docItemComponent: '@theme/ApiItem',
      },
    ],
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'api',
        config: Object.fromEntries(apis.map(({id, spec}) => [id, {
          specPath: `openapi/${spec}`,
          outputDir: `generated/api/${id}`,
          sidebarOptions: {groupPathsBy: 'tag'},
        }])),
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: apis.map(({id, intro}) => ({
          from: `/reference/${id}`,
          to: `/api/${id}/${intro}`,
        })),
      },
    ],
    function openApiWebpackPlugin() {
      return {
        name: 'openapi-webpack',
        configureWebpack() {
          return {
            resolve: {fallback: {path: require.resolve('path-browserify')}},
          };
        },
      };
    },
  ],

  themes: ['@docusaurus/theme-mermaid', 'docusaurus-theme-openapi-docs'],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: false,
    },
    metadata: [
      {
        name: 'keywords',
        content: 'Trader OpenAPI, FxServer, WebProxy, Realtime Chart Server, trading API, chart API, developer platform',
      },
    ],
    navbar: {
      title: 'DEVELOPER PLATFORM',
      logo: {
        alt: 'mF Technologies',
        src: 'img/mf-technologies.svg',
        srcDark: 'img/mf-technologies-dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          to: '/docs/fx-server/openapi-trader',
          label: 'Trader API',
          position: 'left',
        },
        {
          to: '/docs/web-proxy/openapi',
          label: 'WebProxy API',
          position: 'left',
        },
        {
          to: '/docs/realtime-chart-server/openapi',
          label: 'Chart API',
          position: 'left',
        },
        {
          to: '/docs/getting-started/first-trade',
          label: 'Start building',
          position: 'right',
          className: 'navbar__start-link',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Onboarding',
          items: [
            {label: 'Platform overview', to: '/docs/intro'},
            {label: 'Make your first trade', to: '/docs/getting-started/first-trade'},
            {label: 'REST essentials', to: '/docs/fx-server/general-rest-api-information'},
            {label: 'Trader API Client Starter Kit', href: 'https://github.com/mF-Technologies/trader-api-client-starter-kit', target: '_blank'},
          ],
        },
        {
          title: 'API reference',
          items: [
            {label: 'FxServer Trader', to: '/docs/fx-server/openapi-trader'},
            {label: 'WebProxy', to: '/docs/web-proxy/openapi'},
            {label: 'Realtime Chart Server', to: '/docs/realtime-chart-server/openapi'},
          ],
        },
        {
          title: 'Core concepts',
          items: [
            {label: 'Contracts', to: '/docs/business-logic/contract-overview'},
            {label: 'Currencies', to: '/docs/business-logic/currency-overview'},
            {label: 'Price concepts', to: '/docs/business-logic/price-concept'},
            {label: 'Chart data and periods', to: '/docs/realtime-chart-server/overview'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} mF Technologies. Developer Platform.`,
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ['bash'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
