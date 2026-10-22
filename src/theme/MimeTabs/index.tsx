import React, {Children, isValidElement, type ReactNode} from 'react';
import MimeTabs from '@theme-original/MimeTabs';

type MediaTab = {label?: ReactNode; value: string; children: ReactNode};

export default function ApiMimeTabs(props: React.ComponentProps<typeof MimeTabs>) {
  const tabs = Children.toArray(props.children).filter(isValidElement<MediaTab>);
  if (tabs.length !== 1) return <MimeTabs {...props} />;

  const {label, value, children} = tabs[0].props;
  return <div><p className="api-content-type">{label ?? value}</p>{children}</div>;
}
