// Libraries
import React, {PureComponent} from 'react';

// Types
import {PresenseOptions} from './types';
import {PanelProps} from '@grafana/ui';

export interface Props extends PanelProps<PresenseOptions> {}

interface State {
  html: string;
}

export class PresencePanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      html: 'xxxx',
    };
  }

  render() {
    return <div>TODO! presense panel!!!</div>;
  }
}
