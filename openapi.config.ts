export type ApiDefinition = {
  id: string;
  label: string;
  spec: string;
  intro: string;
};

export const apis: ApiDefinition[] = [
  {id: 'fxserver-trader', label: 'FxServer Trader', spec: 'fxserver-trader.yaml', intro: 'fxserver-trader-api'},
  {id: 'webproxy', label: 'WebProxy', spec: 'webproxy.yml', intro: 'web-proxy'},
  {id: 'realtime-chart-server', label: 'Realtime Chart Server', spec: 'realtime-chart-server.yml', intro: 'chart-server'},
];
