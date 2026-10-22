/* Adapted from docusaurus-theme-openapi-docs (MIT), Copyright (c) Palo Alto Networks. */
import React, {useState} from 'react';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {usePrismTheme} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import CopyButton from '@theme/ApiExplorer/ApiCodeBlock/CopyButton';
import Line from '@theme/ApiExplorer/ApiCodeBlock/Line';
import WordWrapButton from '@theme/ApiExplorer/ApiCodeBlock/WordWrapButton';
import type {Props} from 'docusaurus-theme-openapi-docs/lib/theme/ApiExplorer/ApiCodeBlock/ExpandButton';
import clsx from 'clsx';
import {Highlight} from 'prism-react-renderer';
import Modal from 'react-modal';

export default function ApiExpandButton({code, className, language, showLineNumbers, title, lineClassNames}: Props) {
  const [open, setOpen] = useState(false);
  const [wrapped, setWrapped] = useState(true);
  const isBrowser = useIsBrowser();
  const theme = usePrismTheme();
  const expandLabel = translate({id: 'theme.CodeBlock.expandButtonAriaLabel', message: 'Expand code to fullscreen'});
  const closeLabel = translate({id: 'theme.CodeBlock.exitButtonAriaLabel', message: 'Exit expanded view'});
  return <>
    <button type="button" className={clsx('clean-btn', className)} aria-label={expandLabel}
      title={expandLabel} onClick={() => {setWrapped(true); setOpen(true);}}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor"
        d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z" /></svg>
    </button>
    <Modal isOpen={open} onRequestClose={() => setOpen(false)}
      appElement={isBrowser ? document.getElementById('__docusaurus') ?? undefined : undefined}
      contentLabel={translate({id: 'api.code.fullscreen', message: 'Code sample'})}
      className="openapi-explorer__expand-modal-content api-code-dialog"
      overlayClassName="openapi-explorer__expand-modal-overlay">
      <div className="api-code-toolbar" role="group" aria-label={translate({id: 'api.code.tools', message: 'Code sample tools'})}>
        <WordWrapButton className="openapi-explorer__code-block-code-btn" isEnabled={wrapped}
          onClick={() => setWrapped(value => !value)} />
        <CopyButton className="openapi-explorer__code-block-code-btn" code={code} />
        <button type="button" className="clean-btn openapi-explorer__code-block-code-btn"
          aria-label={closeLabel} title={closeLabel} onClick={() => setOpen(false)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor"
            d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5z" /></svg>
        </button>
      </div>
      {title && <div className="openapi-explorer__code-block-title">{title}</div>}
      <Highlight theme={theme} code={code} language={language ?? 'text'}>
        {({className: highlightClass, tokens, getLineProps, getTokenProps}) => <pre tabIndex={0}
          className={clsx(highlightClass, 'openapi-explorer__code-block', 'thin-scrollbar')}>
          <code className="openapi-explorer__code-block-lines"
            style={{whiteSpace: wrapped ? 'pre-wrap' : 'pre', overflowWrap: wrapped ? 'anywhere' : 'normal'}}>
            {tokens.map((line, index) => <Line key={index} line={line} getLineProps={getLineProps}
              getTokenProps={getTokenProps} classNames={lineClassNames[index]} showLineNumbers={showLineNumbers} />)}
          </code>
        </pre>}
      </Highlight>
    </Modal>
  </>;
}
