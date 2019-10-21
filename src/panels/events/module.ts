import { PanelPlugin } from '@grafana/ui';

import { EventsPanelEditor } from './EventsPanelEditor';
import { EventsPanel } from './EventsPanel';
import { EventsOptions, defaults } from './types';

export const plugin = new PanelPlugin<EventsOptions>(EventsPanel).setDefaults(defaults).setEditor(EventsPanelEditor);
