import type {SchemaObject} from 'docusaurus-plugin-openapi-docs/src/openapi/types';

// Upstream discriminator tabs do not dispatch sample selections; ordinary
// oneOf/anyOf tabs do. Adapt only the rendered request schema, not the spec.
export function requestSchemaForSamples(schema: SchemaObject): SchemaObject {
  const result = {...schema};
  const propertyName = schema.discriminator?.propertyName;
  for (const key of ['oneOf', 'anyOf', 'allOf'] as const) {
    if (!schema[key]) continue;
    result[key] = schema[key].map(branch => {
      const adapted = requestSchemaForSamples(branch);
      if (propertyName && key !== 'allOf') {
        const property = branch.properties?.[propertyName];
        const value = property?.const ?? (property?.enum?.length === 1 ? property.enum[0] : undefined);
        if (value !== undefined) adapted.title = String(value);
      }
      return adapted;
    });
  }
  if (schema.oneOf || schema.anyOf) delete result.discriminator;
  if (schema.properties) {
    result.properties = Object.fromEntries(Object.entries(schema.properties)
      .map(([name, property]) => [name, requestSchemaForSamples(property)]));
  }
  if (schema.items) {
    result.items = requestSchemaForSamples(schema.items);
  }
  return result;
}
