// Libraries
import React, {PureComponent} from 'react';

// Types
import {AppRootProps} from '@grafana/ui';
import {AppOptions} from 'types';

interface Props extends AppRootProps<AppOptions> {}

export const SessionPage_ID = 'session';

export class SessionPage extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return <div>SESSION Page</div>;
  }
}
