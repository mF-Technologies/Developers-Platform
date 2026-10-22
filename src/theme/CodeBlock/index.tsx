import React, {useContext} from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import ApiCodeBlock from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/ApiCodeBlock';
import {ApiReferenceContext} from '@site/src/components/ApiReferenceContext';
import type {Props} from '@theme/CodeBlock';

export default function ReferenceCodeBlock(props: Props) {
  return useContext(ApiReferenceContext) ? <ApiCodeBlock {...props} /> : <CodeBlock {...props} />;
}
