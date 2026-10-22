import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';
import {apiServices, openApiConfig} from './api-services';

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

  future: {
    v4: true,
  },

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
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    'docusaurus-theme-openapi-docs',
    '@docusaurus/theme-mermaid',
    ['@easyops-cn/docusaurus-search-local', {
      hashed: true,
      language: ['en', 'zh'],
      indexBlog: false,
      highlightSearchTermsOnTargetPage: true,
      searchBarShortcutHint: false,
    }],
  ],

  plugins: [
    ['docusaurus-plugin-openapi-docs', {id: 'api', docsPluginId: 'classic', config: openApiConfig}],
    function legacyApiRoutes(context) {
      return {
        name: 'legacy-api-routes',
        async contentLoaded({actions}) {
          for (const service of apiServices) {
            actions.addRoute({
              path: `${context.baseUrl}reference/${service.legacy}`,
              component: '@site/src/components/LegacyApiRoute.tsx',
              exact: true,
            });
          }
        },
      };
    },
  ],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    api: {authPersistence: false, requestCredentials: 'omit'},
    languageTabs: [
      {language: 'curl', variant: 'curl', variants: ['curl'], logoClass: 'curl'},
      {language: 'python', variant: 'requests', variants: ['requests'], logoClass: 'python'},
      {language: 'javascript', variant: 'fetch', variants: ['fetch'], logoClass: 'javascript'},
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
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
          to: '/docs/guides',
          position: 'left',
          label: 'Guides',
          activeBaseRegex: '/docs/(guides|realtime-chart-server/overview|fx-server/(general-rest-api-information|price-steaming))/?$',
        },
        {
          type: 'dropdown',
          label: 'API reference',
          position: 'left',
          activeBaseRegex: '/docs/(api/.*|api-reference|fx-server/openapi-trader|web-proxy/openapi|realtime-chart-server/openapi)/?$',
          items: [
            {label: 'API reference overview', to: '/docs/api-reference'},
            ...apiServices.map(service => ({
              label: service.label,
              to: `/docs/${service.overview}`,
              activeBaseRegex: `/docs/(api/${service.id}/.*|${service.overview})/?$`,
            })),
          ],
        },
        {
          to: '/docs/getting-started/connect-your-ai',
          label: 'MCP',
          position: 'left',
        },
        {
          href: 'https://github.com/mF-Technologies/trader-api-client-starter-kit',
          label: 'Examples',
          position: 'left',
          target: '_blank',
        },
        {
          to: '/docs/intro',
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
      style: 'light',
      links: [
        {
          title: 'Get started',
          items: [
            {label: 'Platform overview', to: '/docs/intro'},
            {label: 'Make your first trade', to: '/docs/getting-started/first-trade'},
            {label: 'Get live prices', to: '/docs/getting-started/get-prices'},
          ],
        },
        {
          title: 'Guides',
          items: [
            {label: 'REST essentials', to: '/docs/fx-server/general-rest-api-information'},
            {label: 'Realtime Chart Server', to: '/docs/realtime-chart-server/overview'},
            {label: 'Price streaming', to: '/docs/fx-server/price-steaming'},
          ],
        },
        {
          title: 'API reference',
          items: [
            {label: 'API reference overview', to: '/docs/api-reference'},
            {label: 'FxServer Trader', to: '/docs/fx-server/openapi-trader'},
            {label: 'WebProxy', to: '/docs/web-proxy/openapi'},
            {label: 'Realtime Chart Server', to: '/docs/realtime-chart-server/openapi'},
          ],
        },
        {
          title: 'MCP & examples',
          items: [
            {label: 'Connect your AI tool', to: '/docs/getting-started/connect-your-ai'},
            {label: 'Trader API Client Starter Kit', href: 'https://github.com/mF-Technologies/trader-api-client-starter-kit', target: '_blank'},
          ],
        },
        {
          title: 'Core concepts',
          items: [
            {label: 'Contracts', to: '/docs/business-logic/contract-overview'},
            {label: 'Currencies', to: '/docs/business-logic/currency-overview'},
            {label: 'Price concepts', to: '/docs/business-logic/price-concept'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} mF Technologies. Developer Platform.`,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },
    prism: {
      theme: {
        ...prismThemes.github,
        styles: [
          ...prismThemes.github.styles,
          {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#606b77'}},
          {types: ['namespace'], style: {opacity: 1}},
          {types: ['string', 'attr-value'], style: {color: '#ad1554'}},
          {types: ['entity', 'url', 'symbol', 'number', 'boolean', 'variable',
            'constant', 'property', 'regex', 'inserted'], style: {color: '#126e6c'}},
          {types: ['atrule', 'attr-name', 'selector'], style: {color: '#006a95'}},
          {types: ['function', 'deleted', 'tag'], style: {color: '#b72d3b'}},
        ],
      },
      darkTheme: {
        ...prismThemes.oneDark,
        plain: {color: '#cbd5df', backgroundColor: '#202d38'},
        styles: [...prismThemes.oneDark.styles,
          {types: ['comment', 'prolog', 'cdata'], style: {color: '#9aa9b5'}}],
      },
      additionalLanguages: ['bash', 'powershell'],
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
