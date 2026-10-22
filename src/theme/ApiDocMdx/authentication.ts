export function groupSecuritySchemes(schemes: Record<string, Record<string, unknown>>) {
  const groups = new Map<string, {names: string[]; scheme: Record<string, unknown>}>();
  for (const [name, scheme] of Object.entries(schemes)) {
    const key = JSON.stringify(Object.entries(scheme).sort(([a], [b]) => a.localeCompare(b)));
    const existing = groups.get(key);
    if (existing) existing.names.push(name);
    else groups.set(key, {names: [name], scheme});
  }
  return [...groups.values()];
}
