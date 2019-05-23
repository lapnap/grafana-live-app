// Libraries
import React, {PureComponent} from 'react';

// Types
import {EventsOptions} from './types';
import {PanelProps} from '@grafana/ui';

export interface Props extends PanelProps<EventsOptions> {}

interface State {
  html: string;
}

export class EventsPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      html: 'xxxx',
    };
  }

  render() {
    return <div>TODO! show events.</div>;
  }
}
