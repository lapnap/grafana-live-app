import { DataSourcePlugin } from '@grafana/ui';

import { LiveDataSource } from './LiveDataSource';
import { LiveQueryEditor } from './LiveQueryEditor';
import { LiveConfigEditor } from './LiveConfigEditor';
import { LiveOptions, LiveQuery } from './types';

export const plugin = new DataSourcePlugin<LiveDataSource, LiveQuery, LiveOptions>(LiveDataSource)
  .setConfigEditor(LiveConfigEditor)
  .setQueryEditor(LiveQueryEditor);
