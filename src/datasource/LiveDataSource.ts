// Types
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataStreamObserver,
} from '@grafana/ui';

import {LiveQuery, LiveOptions} from './types';
// import {plugin as app} from '../module';

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
    // if (!app.live) {
    //   return Promise.reject('Not connected');
    // }

    return Promise.resolve({data: []});
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
