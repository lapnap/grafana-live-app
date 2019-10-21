// Libraries
import React, { PureComponent } from 'react';

// Components
import { PanelEditorProps, PanelOptionsGroup } from '@grafana/ui';

// Types
import { PresenseOptions } from './types';

export class PresensePanelEditor extends PureComponent<PanelEditorProps<PresenseOptions>> {
  render() {
    return (
      <PanelOptionsGroup title="Presense">
        <div className="gf-form-inline">TODO....</div>
      </PanelOptionsGroup>
    );
  }
}
