import React from 'react';
import {Redirect, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {apiServices} from '@site/api-services';

export default function LegacyApiRoute() {
  const {pathname, hash} = useLocation();
  const service = apiServices.find(service => pathname.replace(/\/$/, '').endsWith(`/reference/${service.legacy}`));
  const destination = useBaseUrl(service ? `/docs/${service.overview}` : '/docs/api-reference');
  return <Redirect to={`${destination}${hash}`} />;
}
