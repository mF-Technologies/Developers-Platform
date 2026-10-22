import {sampleFromSchema} from 'docusaurus-plugin-openapi-docs/lib/openapi/createSchemaExample';
import {resolveSchemaWithSelections} from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/Body/resolveSchemaWithSelections';
import type {ApiItem} from 'docusaurus-plugin-openapi-docs/src/types';

export function sampleDefaults(item: ApiItem, contentType: string | undefined,
  selections: Record<string, number>) {
  const media = contentType ? item.requestBody?.content?.[contentType] : undefined;
  const schema = resolveSchemaWithSelections(media?.schema, selections);
  const example = schema ? sampleFromSchema(schema, {type: 'request'}) : item.jsonRequestBodyExample;
  return {
    server: item.servers?.[0],
    body: contentType && (contentType.includes('application/json') || contentType.endsWith('+json'))
      && example !== undefined ? JSON.stringify(example, null, 2) : undefined,
  };
}
