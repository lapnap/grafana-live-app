// Libraries
import React, { PureComponent, ChangeEvent } from 'react';

// Types
import { LiveDataSource } from './LiveDataSource';
import { LiveQuery, LiveOptions } from './types';

import { QueryEditorProps } from '@grafana/ui';

type Props = QueryEditorProps<LiveDataSource, LiveQuery, LiveOptions>;

interface State {}

export class LiveQueryEditor extends PureComponent<Props, State> {
  onPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    // const {onChange, query} = this.props;
    // onChange({...query, subject: event.target.value});
  };

  render() {
    return <div className="gf-form">TODO: subject dropdown...</div>;
  }
}
