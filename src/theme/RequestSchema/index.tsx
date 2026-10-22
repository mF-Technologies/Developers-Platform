import React, {useMemo} from 'react';
import RequestSchema from '@theme-original/RequestSchema';
import type UpstreamRequestSchema from 'docusaurus-theme-openapi-docs/lib/theme/RequestSchema';
import {requestSchemaForSamples} from './requestSchema';

export default function SampleRequestSchema(props: React.ComponentProps<typeof UpstreamRequestSchema>) {
  const body = useMemo(() => props.body && ({...props.body,
    content: props.body.content && Object.fromEntries(Object.entries(props.body.content)
      .map(([type, media]) => [type, {...media,
        schema: media.schema && requestSchemaForSamples(media.schema),
      }])),
  }), [props.body]);
  if (!body) return null;
  return <RequestSchema {...props} body={body} />;
}
