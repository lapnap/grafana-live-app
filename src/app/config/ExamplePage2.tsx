// Libraries
import React, {PureComponent} from 'react';

// Types
import {PluginConfigPageProps, GrafanaPlugin} from '@grafana/ui';

interface Props extends PluginConfigPageProps<GrafanaPlugin> {}

export class ExamplePage2 extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {query} = this.props;

    return (
      <div>
        22222222222222222222222222222222
        <pre>{JSON.stringify(query)}</pre>
        22222222222222222222222222222222
      </div>
    );
  }
}
