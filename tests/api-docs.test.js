const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const zlib = require('node:zlib');
const yaml = require('js-yaml');
const {apis} = require('../openapi.config.ts');

const siteDir = path.join(__dirname, '..');
const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

for (const {id, spec, intro} of apis) {
  test(`${id}: generates an introduction and every REST operation`, () => {
    const specification = yaml.load(fs.readFileSync(path.join(siteDir, 'openapi', spec), 'utf8'));
    const outputDir = path.join(siteDir, 'generated/api', id);
    assert.ok(fs.existsSync(path.join(outputDir, `${intro}.info.mdx`)));
    assert.ok(fs.existsSync(path.join(outputDir, 'sidebar.ts')));

    const expectedOperations = [];
    for (const [endpoint, operations] of Object.entries(specification.paths)) {
      for (const method of methods) {
        if (operations[method]) expectedOperations.push(`${method} ${endpoint}`);
      }
    }

    const generatedOperations = fs.readdirSync(outputDir)
      .filter((file) => file.endsWith('.api.mdx'))
      .map((file) => {
        const content = fs.readFileSync(path.join(outputDir, file), 'utf8');
        const frontMatter = yaml.load(content.split('---')[1]);
        const api = JSON.parse(zlib.inflateSync(Buffer.from(frontMatter.api, 'base64')).toString());
        return `${api.method} ${api.path}`;
      });

    assert.deepEqual(generatedOperations.sort(), expectedOperations.sort());
  });
}
