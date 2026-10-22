import React, {useEffect} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory, useLocation} from '@docusaurus/router';
import Translate, {translate} from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import navigation from '@site/src/generated/api-navigation.json';
import {resolveLegacyHash} from '@site/scripts/api-navigation';
import {groupSecuritySchemes} from './authentication';

export default function ApiDocMdx({id}: {id: keyof typeof navigation}) {
  const service = navigation[id];
  const {hash} = useLocation();
  const history = useHistory();
  const apiBase = useBaseUrl(`/docs/api/${service.id}/`);
  const specUrl = useBaseUrl(`/openapi/${service.spec.split('/').pop()}`);
  useEffect(() => {
    const target = resolveLegacyHash(service.aliases, hash);
    if (target?.startsWith('#')) history.replace({hash: target});
    else if (target) history.replace(`${apiBase}${target}`);
  }, [apiBase, hash, history, service]);
  const chart = service.id === 'chart';
  const authGroups = groupSecuritySchemes(service.securitySchemes);
  const bearerOnly = authGroups.length > 0 && authGroups.every(({scheme}) =>
    scheme.type === 'http' && String(scheme.scheme).toLowerCase() === 'bearer');
  return <>
    <p>{translate({id: `api.overview.${service.id}.description`, message: {
      fxserver: 'Submit and manage trades, retrieve positions and account balances, and receive account updates through the FxServer Trader REST API.',
      webproxy: 'Exchange an API key for an access token and retrieve account, contract and trading-history data through the WebProxy REST API.',
      chart: 'Retrieve historical candles, open prices and live statistics for supported instruments through the Realtime Chart Server REST API.',
    }[service.id]})}</p>
    <p className="api-overview-version"><Translate id="api.overview.version">API version</Translate>: <code>{service.version}</code></p>
    <div className="api-overview-actions">
      <a className="button button--outline button--primary" href={specUrl} download>
        <Translate id="api.download">Download OpenAPI specification</Translate>
      </a>
      <Link to={chart ? '/docs/realtime-chart-server/overview' : '/docs/fx-server/general-rest-api-information'}>
        {chart ? <Translate id="api.overview.chart.guideLabel">Realtime Chart Server guide</Translate>
          : <Translate id="api.overview.auth.guideLabel">REST API essentials</Translate>}
      </Link>
    </div>
    {authGroups.length > 0 && <section className="api-overview-auth" aria-labelledby="authentication">
      <Heading as="h2" id="authentication"><Translate id="api.authentication">Authentication</Translate></Heading>
      {bearerOnly && <>
        <p><Translate id="api.overview.auth.bearer">Protected endpoints use Bearer authentication in the Authorization header.</Translate></p>
        <CodeBlock language="http">{'Authorization: Bearer <credential>'}</CodeBlock>
      </>}
      <p><Translate id="api.overview.auth.requirements">Use the credential required by the endpoint's authorization scheme. Scheme names sharing a header format do not imply interchangeable credentials.</Translate></p>
      <details className="api-overview-auth-details">
        <summary><Translate id="api.overview.auth.details">OpenAPI security schemes</Translate></summary>
        <dl>
          {authGroups.map(({names, scheme}) => <React.Fragment key={names[0]}>
            <dt>{names.map((name, index) => <React.Fragment key={name}>
              {index > 0 && ', '}<code id={`authentication-${name}`}>{name}</code>
            </React.Fragment>)}</dt>
            <dd>{Object.entries(scheme).map(([property, value]) => <span key={property}>
              <code>{property}</code>: {typeof value === 'string' ? value : JSON.stringify(value)}
            </span>)}</dd>
          </React.Fragment>)}
        </dl>
      </details>
    </section>}
  </>;
}
