import React from 'react';
import NativeApiItem from '@theme-original/ApiItem';
import DocItem from '@theme/DocItem';
import type {Props} from '@theme/DocItem';
import {ApiReferenceContext} from '@site/src/components/ApiReferenceContext';
import {Redirect, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

function OverviewRedirect({overview}: {overview: string}) {
  const destination = useBaseUrl(`/docs/${overview}`);
  const {hash} = useLocation();
  return <Redirect to={`${destination}${hash}`} />;
}

export default function ApiItem(props: Props) {
  const overview = 'api_overview' in props.content.frontMatter
    ? props.content.frontMatter.api_overview : undefined;
  if (typeof overview === 'string') return <OverviewRedirect overview={overview} />;
  return 'api' in props.content.frontMatter
    ? <ApiReferenceContext.Provider value={true}><NativeApiItem {...props} /></ApiReferenceContext.Provider>
    : <DocItem {...props} />;
}
