/* Adapted from docusaurus-theme-openapi-docs (MIT), Copyright (c) Palo Alto Networks. */
import React from 'react';
import {translate} from '@docusaurus/Translate';
import clsx from 'clsx';

type Props = {
  className?: string;
  onClick: React.MouseEventHandler;
  isEnabled: boolean;
};

export default function WordWrapButton({className, onClick, isEnabled}: Props) {
  const title = translate({id: 'theme.CodeBlock.wordWrapToggle', message: 'Toggle word wrap'});
  return (
    <button type="button" className={clsx('clean-btn', className,
      isEnabled && 'openapi-explorer__code-block-word-wrap-btn--enabled')}
      onClick={onClick} aria-label={title} title={title} aria-pressed={isEnabled}>
      <svg className="openapi-explorer__code-block-word-wrap-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3l3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z" />
      </svg>
    </button>
  );
}
