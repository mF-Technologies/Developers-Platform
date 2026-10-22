import React from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItemPaginator from '@theme-original/DocItem/Paginator';

export default function PagePaginator() {
  const {metadata} = useDoc();
  return metadata.previous || metadata.next ? <DocItemPaginator /> : null;
}
