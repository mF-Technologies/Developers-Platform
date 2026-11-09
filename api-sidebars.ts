import fs from 'node:fs';
import path from 'node:path';
import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {apis} from './openapi.config';

const apiSidebar: SidebarsConfig[string] = apis.map(({id, label, intro}) => {
  const sidebarPath = path.join(__dirname, 'generated/api', id, 'sidebar.ts');
  const generatedSidebar = fs.existsSync(sidebarPath) ? require(sidebarPath).default : undefined;
  const generatedItems = generatedSidebar?.apisidebar ?? generatedSidebar ?? [];

  function addTranslationKeys(items: any[], prefix: string): any[] {
    return items.map((item, index) => ({
      ...item,
      key: `${prefix}-${index}`,
      ...(item.items ? {items: addTranslationKeys(item.items, `${prefix}-${index}`)} : {}),
    }));
  }

  const items = addTranslationKeys(generatedItems, id);

  return {
    type: 'category' as const,
    label,
    link: {type: 'doc' as const, id: `${id}/${intro}`},
    items,
  };
});

const sidebars: SidebarsConfig = {apiSidebar};
export default sidebars;
