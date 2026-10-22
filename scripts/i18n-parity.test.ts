/// <reference types="bun-types/test" />

import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, test} from 'bun:test';
import type {ThemeConfig} from '@docusaurus/preset-classic';
import {parse} from 'yaml';
import sidebars from '../sidebars';
import config from '../docusaurus.config';
import {apiServices} from '../api-services';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = resolve(repositoryRoot, 'docs');
const locales = ['zh-Hant', 'zh-Hans'] as const;

function contentFiles(root: string, base = root): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(root, {withFileTypes: true})) {
    const entryPath = resolve(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...contentFiles(entryPath, base));
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(relative(base, entryPath).replaceAll('\\', '/'));
    }
  }

  return files.sort();
}

function fencedCodeBlocks(contents: string): string[] {
  const normalized = contents.replaceAll('\r\n', '\n');
  return [...normalized.matchAll(/```[^\n]*\n[\s\S]*?```/g)].map(
    ([block]) => block,
  );
}

const sourceDocs = contentFiles(docsRoot);
const requiredLocaleFiles = [
  'code.json',
  'docusaurus-plugin-content-docs/current.json',
  'docusaurus-theme-classic/footer.json',
  'docusaurus-theme-classic/navbar.json',
];
const apiWrappers = [
  'fx-server/openapi-trader.mdx',
  'web-proxy/openapi.mdx',
  'realtime-chart-server/openapi.mdx',
];

function translationKeys(locale: (typeof locales)[number], file: string): string[] {
  const contents = readFileSync(
    resolve(repositoryRoot, `i18n/${locale}/${file}`),
    'utf8',
  );
  return Object.keys(JSON.parse(contents) as Record<string, unknown>).sort();
}

describe('localized public documentation', () => {
  test('navbar offers each API directly and keeps the owning service active on endpoints', () => {
    const items = (config.themeConfig as ThemeConfig).navbar!.items!;
    const reference = items.find(item => item.label === 'API reference');
    expect(reference?.type).toBe('dropdown');
    expect(reference?.to).toBeUndefined();
    expect(reference?.items?.[0].to).toBe('/docs/api-reference');
    for (const service of apiServices) {
      const link = reference?.items?.find(item => item.label === service.label);
      expect(link?.to).toBe(`/docs/${service.overview}`);
      expect(typeof link?.activeBaseRegex).toBe('string');
      const activeService = new RegExp(String(link?.activeBaseRegex));
      expect(activeService.test(`/docs/api/${service.id}/example`)).toBe(true);
      expect(activeService.test('/docs/intro')).toBe(false);
      for (const locale of locales) {
        expect(translationKeys(locale, 'docusaurus-theme-classic/navbar.json'))
          .toContain(`item.label.${service.label}`);
      }
    }
  });
  test('curated pages inherit pagination from the current sidebar in every locale', () => {
    for (const root of [docsRoot, ...locales.map(locale =>
      resolve(repositoryRoot, `i18n/${locale}/docusaurus-plugin-content-docs/current`))]) {
      for (const file of sourceDocs.filter(file => !file.startsWith('api/'))) {
        const front = parse(readFileSync(resolve(root, file), 'utf8').split(/^---\s*$/m)[1]);
        expect(front.pagination_prev).toBeUndefined();
        expect(front.pagination_next).toBeUndefined();
      }
    }
  });
  test('configures English, Traditional Chinese, and Simplified Chinese', () => {
    const config = readFileSync(resolve(repositoryRoot, 'docusaurus.config.ts'), 'utf8');
    expect(config).toContain("locales: ['en', 'zh-Hant', 'zh-Hans']");
  });

  for (const locale of locales) {
    test(`${locale} has a translation for every public page`, () => {
      const localeRoot = resolve(
        repositoryRoot,
        `i18n/${locale}/docusaurus-plugin-content-docs/current`,
      );
      expect(existsSync(localeRoot)).toBe(true);
      expect(contentFiles(localeRoot)).toEqual(sourceDocs);

      for (const file of sourceDocs) {
        const source = readFileSync(resolve(docsRoot, file), 'utf8');
        const localized = readFileSync(resolve(localeRoot, file), 'utf8');
        // Generated API prose is the canonical English specification in every locale.
        if (file.startsWith('api/')) expect(localized).toBe(source);
        else expect(localized).not.toBe(source);
        expect(fencedCodeBlocks(localized)).toEqual(fencedCodeBlocks(source));
      }
    });

    test(`${locale} has complete navigation translations`, () => {
      for (const file of requiredLocaleFiles) {
        expect(existsSync(resolve(repositoryRoot, `i18n/${locale}/${file}`))).toBe(
          true,
        );
      }
    });

    test(`${locale} API wrappers explain the canonical language`, () => {
      const localeRoot = resolve(
        repositoryRoot,
        `i18n/${locale}/docusaurus-plugin-content-docs/current`,
      );

      for (const wrapper of apiWrappers) {
        const contents = readFileSync(resolve(localeRoot, wrapper), 'utf8');
        expect(contents).toContain('ApiDocMdx');
        expect(contents).toContain('OpenAPI');
        expect(contents).toContain(locale === 'zh-Hant' ? '英文維護' : '英文维护');
      }
    });
  }

  test('localized navigation resources expose the same keys', () => {
    for (const file of requiredLocaleFiles) {
      const traditionalKeys = translationKeys('zh-Hant', file);
      expect(traditionalKeys.length).toBeGreaterThan(0);
      expect(translationKeys('zh-Hans', file)).toEqual(traditionalKeys);
    }
  });

  test('homepage has copy for both Chinese locales', () => {
    const homepage = readFileSync(
      resolve(repositoryRoot, 'src/pages/index.tsx'),
      'utf8',
    );
    expect(homepage).toContain("'zh-Hant': {");
    expect(homepage).toContain("'zh-Hans': {");
  });

  test('MCP setup exposes the same host selectors in every language', () => {
    const expected = ['codex', 'claude-code', 'cursor', 'claude-desktop', 'openclaw', 'hermes'];
    const pages = [
      resolve(docsRoot, 'getting-started/connect-your-ai.mdx'),
      ...locales.map((locale) => resolve(repositoryRoot,
        `i18n/${locale}/docusaurus-plugin-content-docs/current/getting-started/connect-your-ai.mdx`)),
    ];

    for (const page of pages) {
      const contents = readFileSync(page, 'utf8');
      expect(contents).toContain('mcpHostTabs');
      expect(contents).not.toMatch(/^### /m);
      const selectors = [...contents.matchAll(/<TabItem value="([^"]+)"/g)]
        .map((match) => match[1]);
      expect(selectors).toEqual(expected);
      const iconClasses = [...contents.matchAll(/attributes=\{\{className: '(mcpHost\w+)'\}\}/g)]
        .map((match) => match[1]);
      expect(iconClasses).toEqual([
        'mcpHostCodex', 'mcpHostClaudeCode', 'mcpHostCursor',
        'mcpHostClaudeDesktop', 'mcpHostOpenClaw', 'mcpHostHermes',
      ]);
      expect([...contents.matchAll(/<CodeBlock className="mcpPrompt" language="text">/g)])
        .toHaveLength(3);
    }
  });

  test('MCP host icons are local, attributed and safe static SVGs', () => {
    const css = readFileSync(resolve(repositoryRoot, 'src/css/custom.css'), 'utf8');
    const notices = readFileSync(resolve(repositoryRoot, 'THIRD_PARTY_NOTICES.md'), 'utf8');
    expect(notices).toContain('Copyright (c) 2023 LobeHub');
    for (const icon of ['codex', 'claude', 'claudecode', 'cursor', 'openclaw', 'hermesagent']) {
      expect(css).toContain(`static/img/ai-tools/${icon}.svg`);
      const svg = readFileSync(resolve(repositoryRoot, `static/img/ai-tools/${icon}.svg`), 'utf8');
      expect(svg).toContain('<svg');
      expect(svg).not.toMatch(/<script|<foreignObject|\son\w+=|(?:href|src)=/i);
    }
  });

  test('navigation category overviews are not repeated as child pages', () => {
    const categories = sidebars.mainSidebar.filter(
      (item): item is Exclude<typeof item, string> => typeof item !== 'string',
    );
    for (const id of ['guides', 'api-reference']) {
      const category = categories.find((item) => 'link' in item && item.link?.id === id);
      expect(category).toBeDefined();
      expect(category && 'items' in category && category.items).not.toContain(id);
    }
  });

  test('search and API navigation labels have both Chinese translations', () => {
    for (const locale of locales) {
      const labels = JSON.parse(readFileSync(resolve(repositoryRoot, `i18n/${locale}/code.json`), 'utf8'));
      expect(labels['theme.SearchBar.label'].message).toBeTruthy();
      expect(labels['apiReference.overview'].message).toBeTruthy();
      expect(labels['apiReference.services'].message).toBeTruthy();
    }
  });
});
