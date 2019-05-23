// Types
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataStreamObserver,
  SeriesData,
  FieldType,
} from '@grafana/ui';

import {LiveQuery, LiveOptions} from './types';
import {plugin as app} from '../module';

export class LiveDataSource extends DataSourceApi<LiveQuery, LiveOptions> {
  constructor(private instanceSettings: DataSourceInstanceSettings<LiveOptions>) {
    super(instanceSettings);
  }

  getQueryDisplayText(query: LiveQuery) {
    return `${query.subject}`;
  }

  query(
    options: DataQueryRequest<LiveQuery>,
    observer: DataStreamObserver
  ): Promise<DataQueryResponse> {
    if (!app.live) {
      return Promise.reject('Not connected');
    }

    const sessions: SeriesData = {
      fields: [
        {name: 'id', type: FieldType.string},
        {name: 'start', type: FieldType.time},
        {name: 'end', type: FieldType.time},
        {name: 'user_id', type: FieldType.string},
        {name: 'user_name', type: FieldType.string},
        {name: 'user_icon', type: FieldType.string},
      ],
      rows: [],
    };

    for (const id of app.sessions.sessions.keys()) {
      const s = app.sessions.sessions.get(id);
      if (s) {
        sessions.rows.push([s.id, s.start, s.end, s.who.id, s.who.name, s.who.icon]);
      }
    }

    const events: SeriesData = {
      fields: [
        {name: 'time', type: FieldType.time},
        {name: 'session_id', type: FieldType.string},
        {name: 'action', type: FieldType.string},
        {name: 'key', type: FieldType.string},
        {name: 'info', type: FieldType.other},
      ],
      rows: [],
    };
    for (const evt of app.events.getRecent()) {
      if (evt) {
        events.rows.push([evt.time, evt.session, evt.action, evt.key, evt.info]);
      }
    }

    console.log('GET', app, sessions);

    return Promise.resolve({data: [events]});
  }

  testDatasource() {
    const url = this.instanceSettings.url;
    if (!url || !url.startsWith('http')) {
      return Promise.resolve({
        status: 'error',
        message: 'Invalid URL',
      });
    }

    return fetch(url + 'info/git', {
      method: 'GET',
    }).then(response => {
      console.log('TEST', response);
      return {
        status: 'success',
        message: 'OK',
      };
    });
  }
}
