// Libraries
import React, {PureComponent, ChangeEvent} from 'react';

// Types
import {LiveOptions} from './types';

import {DataSourcePluginOptionsEditorProps, DataSourceSettings, FormField} from '@grafana/ui';

type LiveSettings = DataSourceSettings<LiveOptions>;

interface Props extends DataSourcePluginOptionsEditorProps<LiveSettings> {}

interface State {}

export class LiveConfigEditor extends PureComponent<Props, State> {
  state = {};

  componentDidMount() {}

  onURLChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {onOptionsChange, options} = this.props;
    onOptionsChange({
      ...options,
      url: event.target.value,
      access: 'direct', // HARDCODED For now!
    });
  };

  render() {
    const {options} = this.props;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="URL"
            labelWidth={6}
            onChange={this.onURLChange}
            value={options.url}
            tooltip={'NOTE: hit directly via fetch, not proxy'}
            placeholder="http://localhost:8080/"
          />
        </div>
      </div>
    );
  }
}
