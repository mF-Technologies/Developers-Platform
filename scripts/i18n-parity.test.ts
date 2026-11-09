/// <reference types="bun-types/test" />

import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, test} from 'bun:test';

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
        expect(localized).not.toBe(source);
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
        expect(contents).toContain('Redirect');
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
});
