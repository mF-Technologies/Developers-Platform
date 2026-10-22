/*
 * Adapted from docusaurus-theme-openapi-docs (MIT).
 * Copyright (c) Palo Alto Networks.
 * Keep upstream parsing, highlighting and copy behavior; wrap samples by default.
 */
import React, {useState} from 'react';
import {useThemeConfig, usePrismTheme} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import Container from '@theme/ApiExplorer/ApiCodeBlock/Container';
import CopyButton from '@theme/ApiExplorer/ApiCodeBlock/CopyButton';
import ExpandButton from '@theme/ApiExplorer/ApiCodeBlock/ExpandButton';
import Line from '@theme/ApiExplorer/ApiCodeBlock/Line';
import WordWrapButton from '@theme/ApiExplorer/ApiCodeBlock/WordWrapButton';
import type {Props} from '@theme/CodeBlock/Content/String';
import {containsLineNumbers, parseCodeBlockTitle, parseLanguage, parseLines} from '@theme/utils/codeBlockUtils';
import clsx from 'clsx';
import {Highlight, type Language} from 'prism-react-renderer';

export default function ApiCodeBlockString({
  children,
  className: blockClassName = '',
  metastring,
  title: titleProp,
  showLineNumbers: showLineNumbersProp,
  language: languageProp,
}: Props) {
  const {prism: {defaultLanguage, magicComments}} = useThemeConfig();
  const language = languageProp ?? parseLanguage(blockClassName) ?? defaultLanguage;
  const theme = usePrismTheme();
  const [wrapped, setWrapped] = useState(true);
  const title = parseCodeBlockTitle(metastring) || titleProp;
  const {lineClassNames, code} = parseLines(children, {metastring, language, magicComments});
  const showLineNumbers = showLineNumbersProp ?? containsLineNumbers(metastring);

  return (
    <Container as="div" className={clsx('api-code-sample', blockClassName,
      language && !blockClassName.includes(`language-${language}`) && `language-${language}`)}>
      {title && <div className="openapi-explorer__code-block-title">{title}</div>}
      <div className="openapi-explorer__code-block-content">
        <div className="openapi-explorer__code-block-btn-group api-code-toolbar"
          role="group" aria-label={translate({id: 'api.code.tools', message: 'Code sample tools'})}>
          <WordWrapButton className="openapi-explorer__code-block-code-btn"
            isEnabled={wrapped} onClick={() => setWrapped(value => !value)} />
          <CopyButton className="openapi-explorer__code-block-code-btn" code={code} />
          <ExpandButton className="openapi-explorer__code-block-code-btn"
            code={code} language={(language ?? 'text') as Language} showLineNumbers={!!showLineNumbers}
            blockClassName={blockClassName} title={typeof title === 'string' ? title : undefined}
            lineClassNames={lineClassNames} />
        </div>
        <Highlight theme={theme} code={code} language={language ?? 'text'}>
          {({className, tokens, getLineProps, getTokenProps}) => (
            <pre tabIndex={0} className={clsx(className, 'openapi-explorer__code-block', 'thin-scrollbar')}>
              <code className={clsx('openapi-explorer__code-block-lines',
                showLineNumbers && 'openapi-explorer__code-block-lines-numbering')}
                style={{whiteSpace: wrapped ? 'pre-wrap' : 'pre', overflowWrap: wrapped ? 'anywhere' : 'normal'}}>
                {tokens.map((line, index) => <Line key={index} line={line} getLineProps={getLineProps}
                  getTokenProps={getTokenProps} classNames={lineClassNames[index]}
                  showLineNumbers={!!showLineNumbers} />)}
              </code>
            </pre>
          )}
        </Highlight>
      </div>
    </Container>
  );
}
