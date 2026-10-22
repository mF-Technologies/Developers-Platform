import {describe, expect, test} from 'bun:test';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateSync} from 'node:zlib';
import {parse} from 'yaml';
import {apiServices} from '../api-services';
import {legacyAliases, resolveLegacyHash, type ApiOperation} from './api-navigation';
import navigation from '../src/generated/api-navigation.json';
import {groupSecuritySchemes} from '../src/theme/ApiDocMdx/authentication';
import {sampleDefaults} from '../src/theme/ApiExplorer/sampleDefaults';
import {requestSchemaForSamples} from '../src/theme/RequestSchema/requestSchema';
import type {SchemaObject} from 'docusaurus-plugin-openapi-docs/src/openapi/types';
import serverReducer, {setServer} from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/Server/slice';

const root = fileURLToPath(new URL('..', import.meta.url));
const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
const visibility = parse(readFileSync(resolve(root, 'redocly.yaml'), 'utf8'));
const allowedTags = new Set<string>(visibility.decorators['tag-whitelist/only'].tags);

function operationKeys(spec: any): string[] {
  return Object.entries(spec.paths).flatMap(([path, item]) => Object.keys(item as object)
    .filter(method => methods.includes(method)).map(method => `${method} ${path}`)).sort();
}

describe('native API generation and bookmark compatibility', () => {
  test('overview groups identical scheme metadata without dropping scheme names', () => {
    const schemes = {
      trader: {type: 'http', scheme: 'bearer', bearerFormat: 'JWT'},
      ApiKeyAuth: {bearerFormat: 'JWT', scheme: 'bearer', type: 'http'},
      key: {type: 'apiKey', in: 'header', name: 'X-API-Key'},
      other: {type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Different credential'},
    };
    expect(groupSecuritySchemes(schemes)).toEqual([
      {names: ['trader', 'ApiKeyAuth'], scheme: schemes.trader},
      {names: ['key'], scheme: schemes.key},
      {names: ['other'], scheme: schemes.other},
    ]);
    expect(groupSecuritySchemes({})).toEqual([]);
  });
  for (const service of apiServices) {
    test(`${service.id} keeps authentication on the shared overview`, () => {
      const generated = navigation[service.specId] as any;
      const spec = parse(readFileSync(resolve(root, 'static', service.spec), 'utf8'));
      expect(generated.securitySchemes).toEqual(spec.components?.securitySchemes ?? {});
      for (const directory of ['docs/api', ...['zh-Hant', 'zh-Hans'].map(locale =>
        `i18n/${locale}/docusaurus-plugin-content-docs/current/api`)]) {
        for (const file of readdirSync(resolve(root, directory, service.id)).filter(file => file.endsWith('.mdx'))) {
          const front = parse(readFileSync(resolve(root, directory, service.id, file), 'utf8').split(/^---\s*$/m)[1]);
          if (file.endsWith('.api.mdx')) expect(front.info_path).toBe(`docs/${service.overview}`);
          else expect(front.api_overview).toBe(service.overview);
        }
      }
      if (Object.keys(generated.securitySchemes).length) {
        expect(resolveLegacyHash(generated.aliases, '#section/Authentication')).toBe('#authentication');
      }
    });
    test(`${service.id} has one sidebar position per endpoint`, () => {
      const generated = navigation[service.specId];
      const ids = generated.groups.flatMap(group => group.items.map(item => item.id));
      expect(new Set(ids).size).toBe(ids.length);
      expect([...ids].sort()).toEqual(generated.operations.map(op => `api/${service.id}/${op.id}`).sort());
      for (const group of generated.groups) {
        expect(group.items.length).toBeGreaterThan(0);
        for (const item of group.items) {
          const operation = generated.operations.find(op => `api/${service.id}/${op.id}` === item.id)!;
          expect(group.label).toBe(operation.tags[0] ?? 'Endpoints');
        }
      }
    });
    test(`${service.id} generated reference pages inherit sidebar pagination`, () => {
      for (const directory of ['docs/api', ...['zh-Hant', 'zh-Hans'].map(locale =>
        `i18n/${locale}/docusaurus-plugin-content-docs/current/api`)]) {
        for (const file of readdirSync(resolve(root, directory, service.id)).filter(file => file.endsWith('.mdx'))) {
          const front = parse(readFileSync(resolve(root, directory, service.id, file), 'utf8').split(/^---\s*$/m)[1]);
          expect(front.pagination_prev).toBeUndefined();
          expect(front.pagination_next).toBeUndefined();
        }
      }
    });
    test(`${service.id} only publishes allowed operations in pages, navigation and downloads`, () => {
      const source = parse(readFileSync(resolve(root, service.spec), 'utf8'));
      const expected = Object.entries(source.paths).flatMap(([path, item]) =>
        Object.entries(item as Record<string, any>)
          .filter(([method, operation]) => methods.includes(method) &&
            operation.tags?.some((tag: string) => allowedTags.has(tag)))
          .map(([method]) => `${method} ${path}`)).sort();
      const generated = navigation[service.specId];
      expect(generated.operations.map(op => `${op.method} ${op.path}`).sort()).toEqual(expected);
      const download = parse(readFileSync(resolve(root, 'static', service.spec), 'utf8'));
      expect(operationKeys(download)).toEqual(expected);
      for (const directory of ['docs/api', ...['zh-Hant', 'zh-Hans'].map(locale =>
        `i18n/${locale}/docusaurus-plugin-content-docs/current/api`)]) {
        const pages = readdirSync(resolve(root, directory, service.id))
          .filter(file => file.endsWith('.api.mdx')).map(file => {
            const contents = readFileSync(resolve(root, directory, service.id, file), 'utf8');
            const front = parse(contents.split(/^---\s*$/m)[1]);
            const api = JSON.parse(inflateSync(Buffer.from(front.api, 'base64')).toString('utf8'));
            return `${api.method} ${api.path}`;
          }).sort();
        expect(pages).toEqual(expected);
      }
    });
    test(`${service.id} covers every public operation and old link`, () => {
      const spec = parse(readFileSync(resolve(fileURLToPath(new URL('..', import.meta.url)), service.spec), 'utf8'));
      const generated = navigation[service.specId];
      for (const [path, item] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(item as Record<string, any>)) {
          if (!methods.includes(method)) continue;
          const target = generated.operations.find(op => op.path === path && op.method === method);
          if (!operation.tags?.some((tag: string) => allowedTags.has(tag))) {
            expect(target).toBeUndefined();
            if (operation.operationId) {
              expect(resolveLegacyHash(generated.aliases, `#operation/${operation.operationId}`)).toBeUndefined();
            }
            continue;
          }
          expect(target).toBeDefined();
          const pointer = path.replaceAll('~', '~0').replaceAll('/', '~1');
          expect(resolveLegacyHash(generated.aliases, `#/paths/${pointer}/${method}`)).toBe(target!.id);
          if (operation.operationId) {
            expect(resolveLegacyHash(generated.aliases, `#operation/${operation.operationId}`)).toBe(target!.id);
          }
          for (const tag of operation.tags ?? []) {
            expect(resolveLegacyHash(generated.aliases, `#tag/${encodeURIComponent(tag)}/paths/${pointer}/${method}`)).toBe(target!.id);
          }
        }
      }
    });
  }
  test('legacy links preserve JSON pointers, tag spelling and reject malformed hashes', () => {
    const operations: ApiOperation[] = [{id: 'quote', title: 'Quote', tags: ['Market Data'],
      path: '/a~b/{symbol}', method: 'get', operationId: 'getQuote'}];
    const aliases = legacyAliases(operations);
    expect(resolveLegacyHash(aliases, '#tag/Market-Data')).toBe('quote');
    expect(resolveLegacyHash(aliases, '#tag/Market%20Data/operation/getQuote')).toBe('quote');
    expect(resolveLegacyHash(aliases, '#/paths/~1a~0b~1{symbol}/get')).toBe('quote');
    expect(resolveLegacyHash(aliases, '#unknown')).toBeUndefined();
    expect(resolveLegacyHash(aliases, '#%ZZ')).toBeUndefined();
  });
  test('the API explorer does not render an executable request form', async () => {
    const request = resolve(root, 'src/theme/ApiExplorer/Request/index.tsx');
    expect(existsSync(request)).toBe(true);
    const {default: Request} = await import(request);
    expect(Request()).toBeNull();
  });
  test('read-only samples retain every operation server and JSON payload', () => {
    let bodyCount = 0;
    for (const service of apiServices) {
      for (const file of readdirSync(resolve(root, 'docs/api', service.id)).filter(file => file.endsWith('.api.mdx'))) {
        const front = parse(readFileSync(resolve(root, 'docs/api', service.id, file), 'utf8').split(/^---\s*$/m)[1]);
        const api = JSON.parse(inflateSync(Buffer.from(front.api, 'base64')).toString());
        const contentType = Object.keys(api.requestBody?.content ?? {})[0];
        const defaults = sampleDefaults(api, contentType, {});
        expect(defaults.server).toEqual(api.servers?.[0]);
        let serverState: ReturnType<typeof serverReducer> = {options: api.servers ?? [], value: undefined};
        if (defaults.server) serverState = serverReducer(serverState, setServer(JSON.stringify(defaults.server)));
        expect(!defaults.server || serverState.value?.url === defaults.server.url).toBe(true);
        if (api.requestBody) {
          bodyCount++;
          const payload = JSON.parse(defaults.body!);
          expect(Object.keys(payload).length).toBeGreaterThan(0);
          if (api.path === '/addDeal') {
            const originalSchema = structuredClone(api.requestBody.content[contentType!].schema);
            const rendered = requestSchemaForSamples(originalSchema);
            expect(rendered.discriminator).toBeUndefined();
            expect(rendered.oneOf?.map(branch => branch.title)).toEqual(['1', '2']);
            expect(originalSchema.discriminator).toBeDefined();
            expect(rendered.oneOf?.[1].required).toContain('price');
            expect(payload.priceMode).toBe(1);
            expect(typeof payload.amount).toBe('number');
            expect(typeof payload.contractCode).toBe('string');
            expect(JSON.parse(sampleDefaults(api, contentType, {requestBody: 1}).body!).priceMode).toBe(2);
          }
        } else expect(defaults.body).toBeUndefined();
      }
    }
    expect(bodyCount).toBe(6);
  });
  test('request variants retain nested schema paths without changing source metadata', () => {
    const choice = {discriminator: {propertyName: 'mode'}, oneOf: [
      {type: 'object' as const, properties: {mode: {type: 'string' as const, const: 'market'}}},
      {type: 'object' as const, properties: {mode: {type: 'string' as const, enum: ['quoted']}}},
    ]};
    const source = {type: 'object' as const, properties: {orders: {type: 'array' as const, items: choice}}};
    const rendered = requestSchemaForSamples(source);
    const variants = (rendered.properties!.orders.items as SchemaObject).oneOf!;
    expect(variants.map(branch => branch.title)).toEqual(['market', 'quoted']);
    expect(rendered.properties!.orders.items).not.toHaveProperty('discriminator');
    expect(source.properties.orders.items.discriminator).toEqual({propertyName: 'mode'});
  });
});
