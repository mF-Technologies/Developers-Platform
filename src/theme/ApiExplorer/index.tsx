import React, {useEffect, useMemo} from 'react';
import Explorer from '@theme-original/ApiExplorer';
import Translate from '@docusaurus/Translate';
import {useTypedDispatch, useTypedSelector} from 'docusaurus-theme-openapi-docs/lib/theme/ApiItem/hooks';
import {setStringRawBody} from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/Body/slice';
import {setServer} from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/Server/slice';
import {sampleDefaults} from './sampleDefaults';

const emptySelections = {};

export default function ApiExplorer(props: React.ComponentProps<typeof Explorer>) {
  const dispatch = useTypedDispatch();
  const contentType = useTypedSelector(state => state.contentType.value);
  const selections = useTypedSelector(state => state.schemaSelection?.selections ?? emptySelections);
  const body = useTypedSelector(state => state.body);
  const server = useTypedSelector(state => state.server.value);
  const defaults = useMemo(() => sampleDefaults(props.item, contentType, selections),
    [props.item, contentType, selections]);
  const bodyReady = defaults.body === undefined ||
    (body.type === 'raw' && body.content?.type === 'string' && body.content.value === defaults.body);
  const serverReady = !defaults.server || server?.url === defaults.server.url;

  // Samples used to receive these defaults from the executable form's children.
  useEffect(() => {
    if (!bodyReady && defaults.body !== undefined) dispatch(setStringRawBody(defaults.body));
    if (!serverReady && defaults.server) dispatch(setServer(JSON.stringify(defaults.server)));
  }, [dispatch, defaults, bodyReady, serverReady]);

  if (!bodyReady || !serverReady) return null;
  return <><h3 className="api-samples-title"><Translate id="api.requestSample">Request sample</Translate></h3><Explorer {...props} /></>;
}
