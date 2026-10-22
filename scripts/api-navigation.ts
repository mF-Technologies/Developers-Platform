export type ApiOperation = {
  id: string; method: string; path: string; title: string;
  tags: string[]; operationId?: string;
};

export function legacyAliases(operations: ApiOperation[]): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const operation of operations) {
    const pointer = operation.path.replaceAll('~', '~0').replaceAll('/', '~1');
    aliases[`/paths/${pointer}/${operation.method}`] = operation.id;
    if (operation.operationId) aliases[`operation/${operation.operationId}`] = operation.id;
    for (const tag of operation.tags) {
      aliases[`tag/${tag}`] ??= operation.id;
      aliases[`tag/${tag}/paths/${pointer}/${operation.method}`] = operation.id;
      if (operation.operationId) aliases[`tag/${tag}/operation/${operation.operationId}`] = operation.id;
    }
  }
  return aliases;
}

export function resolveLegacyHash(aliases: Record<string, string>, hash: string): string | undefined {
  let decoded: string;
  try { decoded = decodeURIComponent(hash.replace(/^#/, '')); }
  catch { return undefined; }
  // Redoc versions use either spaces or hyphens in tag anchors.
  return (Object.hasOwn(aliases, decoded) ? aliases[decoded] : undefined) ?? Object.entries(aliases).find(
    ([key]) => key.replaceAll(' ', '-') === decoded,
  )?.[1];
}
