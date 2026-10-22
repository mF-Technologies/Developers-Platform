import React from 'react';
import type {Props} from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/MethodEndpoint';

export default function ApiMethodEndpoint({method, path}: Props) {
  return <div className={`api-operation ${method.toLowerCase()}`}>
    <pre className="openapi__method-endpoint">
      <span className="badge">{method.toUpperCase()}</span>
      <h2 className="openapi__method-endpoint-path">{path}</h2>
    </pre>
  </div>;
}
