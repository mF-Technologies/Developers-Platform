import {mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {inflateSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {parse, stringify} from 'yaml';
import {bundle, loadConfig} from '@redocly/openapi-core';
import {apiServices} from '../api-services';
import {legacyAliases, type ApiOperation} from './api-navigation';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['zh-Hant', 'zh-Hans'];
const config = await loadConfig({configPath: resolve(root, 'redocly.yaml')});
// Filter once before generating any public pages, navigation or downloadable specs.
const publicSpecs = await Promise.all(apiServices.map(async service => {
  const result = await bundle({ref: resolve(root, service.spec), config});
  const errors = result.problems.filter(problem => problem.severity === 'error');
  if (errors.length) throw new Error(`${service.id}: public specification failed: ${errors.map(error => error.message).join('; ')}`);
  return {path: resolve(root, 'static', service.spec), contents: stringify(result.bundle.parsed, {lineWidth: 0})};
}));
rmSync(resolve(root, 'static/openapi'), {recursive: true, force: true});
mkdirSync(resolve(root, 'static/openapi'), {recursive: true});
for (const spec of publicSpecs) writeFileSync(spec.path, spec.contents);
const outputRoots = [resolve(root, 'docs/api'), ...locales.map(locale =>
  resolve(root, `i18n/${locale}/docusaurus-plugin-content-docs/current/api`))];
// Only dedicated generated trees are replaced; specs and curated docs stay intact.
for (const output of outputRoots) rmSync(output, {recursive: true, force: true});
const result = spawnSync(process.execPath, ['node_modules/@docusaurus/core/bin/docusaurus.mjs',
  'gen-api-docs', 'all'], {cwd: root, stdio: 'inherit'});
if (result.status !== 0) throw new Error('OpenAPI page generation failed.');

const navigation: Record<string, unknown> = {};
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
for (const service of apiServices) {
  const directory = resolve(root, `docs/api/${service.id}`);
  const operations: ApiOperation[] = [];
  for (const file of readdirSync(directory).filter(file => file.endsWith('.mdx'))) {
    const contents = readFileSync(resolve(directory, file), 'utf8');
    const frontMatter = contents.split(/^---\s*$/m)[1];
    const front = parse(frontMatter);
    if (!file.endsWith('.api.mdx')) {
      front.api_overview = service.overview;
      front.unlisted = true;
    } else {
      front.info_path = `docs/${service.overview}`;
    }
    writeFileSync(resolve(directory, file), contents.replace(/^---\r?\n[\s\S]*?\r?\n---/,
      `---\n${stringify(front, {lineWidth: 0})}---`));
    if (!file.endsWith('.api.mdx')) continue;
    const api = JSON.parse(inflateSync(Buffer.from(front.api, 'base64')).toString('utf8'));
    operations.push({id: front.id, method: api.method, path: api.path,
      title: front.title, tags: api.tags ?? [], operationId: api.operationId});
  }
  const spec = parse(readFileSync(resolve(root, 'static', service.spec), 'utf8'));
  const expected = Object.values(spec.paths).flatMap(item => Object.keys(item as object)
    .filter(method => methods.has(method))).length;
  if (operations.length !== expected || new Set(operations.map(op => op.id)).size !== expected) {
    throw new Error(`${service.id}: generated operations do not match the public specification.`);
  }
  const order = Object.entries(spec.paths).flatMap(([path, item]) => Object.keys(item as object)
    .filter(method => methods.has(method)).map(method => `${method} ${path}`));
  operations.sort((a, b) => order.indexOf(`${a.method} ${a.path}`) - order.indexOf(`${b.method} ${b.path}`));
  const groups = [...new Set(operations.flatMap(op => op.tags.length ? op.tags : ['Endpoints']))]
    .map(tag => ({type: 'category', label: tag, key: `${service.id}.${tag}`, collapsed: true,
      // A page needs one sidebar position so Previous/Next cannot loop over it.
      items: operations.filter(op => (op.tags[0] ?? 'Endpoints') === tag)
        .map(op => ({type: 'doc', id: `api/${service.id}/${op.id}`, label: op.title,
          key: `${service.id}.${tag}.${op.id}`,
          className: `${op.method} api-method`}))}))
    .filter(group => group.items.length > 0);
  const securitySchemes = spec.components?.securitySchemes ?? {};
  const aliases = legacyAliases(operations);
  if (Object.keys(securitySchemes).length) aliases['section/Authentication'] = '#authentication';
  navigation[service.specId] = {...service, version: String(spec.info.version), securitySchemes,
    operations, groups, aliases};
  for (const locale of locales) {
    const destination = resolve(root, `i18n/${locale}/docusaurus-plugin-content-docs/current/api/${service.id}`);
    mkdirSync(destination, {recursive: true});
    for (const file of readdirSync(directory).filter(file => file.endsWith('.mdx'))) {
      writeFileSync(resolve(destination, file), readFileSync(resolve(directory, file)));
    }
  }
}
const generated = resolve(root, 'src/generated');
mkdirSync(generated, {recursive: true});
writeFileSync(resolve(generated, 'api-navigation.json'), JSON.stringify(navigation, null, 2) + '\n');
console.info(`Generated ${Object.values(navigation).length} API services in three locales.`);
