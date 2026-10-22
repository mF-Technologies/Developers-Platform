import buildPostmanRequest from '@theme-original/ApiExplorer/buildPostmanRequest';
import type UpstreamRequest from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/buildPostmanRequest';

export default function apiRequest(...[request, options]: Parameters<typeof UpstreamRequest>) {
  // Missing servers must not make a sample point at the documentation website.
  return buildPostmanRequest(request, {
    ...options,
    server: options.server ?? {url: 'https://api.example.com'},
  });
}
