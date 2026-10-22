export const apiServices = [
  {id: 'fxserver', label: 'FxServer Trader API', spec: 'openapi/fxserver-trader.yaml',
    overview: 'fx-server/openapi-trader', legacy: 'fxserver-trader', specId: 'fxserver-trader-openapi'},
  {id: 'webproxy', label: 'WebProxy API', spec: 'openapi/webproxy.yml',
    overview: 'web-proxy/openapi', legacy: 'webproxy', specId: 'webproxy-openapi'},
  {id: 'chart', label: 'Realtime Chart Server API', spec: 'openapi/realtime-chart-server.yml',
    overview: 'realtime-chart-server/openapi', legacy: 'realtime-chart-server', specId: 'realtime-chart-server-openapi'},
] as const;

export const openApiConfig = Object.fromEntries(apiServices.map(service => [service.id, {
  specPath: `static/${service.spec}`,
  outputDir: `docs/api/${service.id}`,
  hideSendButton: true,
  externalJsonProps: false,
  sidebarOptions: {groupPathsBy: 'tag'},
}]));
