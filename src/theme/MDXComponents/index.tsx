import React, {type ComponentProps} from 'react';
import OriginalComponents from '@theme-original/MDXComponents';

function DocTable(props: ComponentProps<'table'>) {
  return <div className="doc-table-scroll"><table {...props} /></div>;
}

export default {...OriginalComponents, table: DocTable};
