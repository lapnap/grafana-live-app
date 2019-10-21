// Libraries
import React, { PureComponent } from 'react';

// Components
import { PanelEditorProps, PanelOptionsGroup } from '@grafana/ui';

// Types
import { EventsOptions } from './types';

export class EventsPanelEditor extends PureComponent<PanelEditorProps<EventsOptions>> {
  render() {
    return (
      <PanelOptionsGroup title="Events">
        <div className="gf-form-inline">TODO....</div>
      </PanelOptionsGroup>
    );
  }
}
