import {PanelPlugin} from '@grafana/ui';

import {PresensePanelEditor} from './PresensePanelEditor';
import {PresencePanel} from './PresencePanel';
import {PresenseOptions, defaults} from './types';

export const plugin = new PanelPlugin<PresenseOptions>(PresencePanel)
  .setDefaults(defaults)
  .setEditor(PresensePanelEditor);
