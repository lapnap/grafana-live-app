// Types
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  DataStreamObserver,
  SeriesData,
  FieldType,
  DataStreamState,
  LoadingState,
} from '@grafana/ui';

import {LiveQuery, LiveOptions} from './types';
import {app} from 'app/LiveApp';
import {Unsubscribable, PartialObserver} from 'rxjs';
import {PresenseList} from 'feature/PresenseWatcher';
import {PresenseKey, LiveEventDetails} from 'types';

type StreamWorkers = {
  [key: string]: StreamWorker;
};

export class LiveDataSource extends DataSourceApi<LiveQuery, LiveOptions> {
  workers: StreamWorkers = {};

  constructor(private instanceSettings: DataSourceInstanceSettings<LiveOptions>) {
    super(instanceSettings);
  }

  getStartSessionUrl() {
    const url = this.instanceSettings.url;
    return url + 'session/start';
  }

  getQueryDisplayText(query: LiveQuery) {
    return `${query.subject}`;
  }

  async getEventDetais(g: PresenseKey, id: string): Promise<LiveEventDetails> {
    const url = this.instanceSettings.url;
    return fetch(url + `events/live/${g}/${id}`, {
      method: 'GET',
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject('Bad Request');
    });
  }

  async query(
    req: DataQueryRequest<LiveQuery>,
    observer: DataStreamObserver
  ): Promise<DataQueryResponse> {
    // Get the socket, or throw an error
    if (!(await app.getLiveSocket(1000))) {
      return Promise.reject('Faild to get Live Socket');
    }

    let resp: DataQueryResponse = {data: []};
    for (const query of req.targets) {
      // create stream key
      const key = req.dashboardId + '/' + req.panelId + '/' + query.refId;

      if (this.workers[key]) {
        const existing = this.workers[key];
        if (existing.update(query, req)) {
          for (const s of existing.stream.series!) {
            resp.data.push(s);
          }
          continue;
        }
        existing.unsubscribe();
        delete this.workers[key];
      }

      if (true) {
        this.workers[key] = new PresenseWorker(key, query, req, observer);
      }
    }

    return Promise.resolve(resp);
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

export class StreamWorker {
  query: LiveQuery;
  stream: DataStreamState;
  observer?: DataStreamObserver;
  subscription?: Unsubscribable;
  timeoutId = 0;

  constructor(
    key: string,
    query: LiveQuery,
    request: DataQueryRequest,
    observer: DataStreamObserver
  ) {
    this.query = query;
    this.observer = observer;
    this.stream = {
      key,
      state: LoadingState.Streaming,
      request,
      unsubscribe: this.unsubscribe,
    };
  }

  unsubscribe = () => {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }

    this.observer = undefined;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = 0;
    }
  };

  update(query: LiveQuery, request: DataQueryRequest): boolean {
    // Check if stream has been unsubscribed or query changed type
    if (this.observer === null) {
      return false;
    }

    this.stream.request = request; // OK?
    console.log('Reuse Test Stream: ', this);
    return true;
  }
}

export class PresenseWorker extends StreamWorker {
  constructor(
    key: string,
    query: LiveQuery,
    request: DataQueryRequest,
    observer: DataStreamObserver
  ) {
    super(key, query, request, observer);
    this.subscription = app.presense.subscribe(this.presenseObserver);
  }

  presenseObserver: PartialObserver<PresenseList> = {
    next: (presense: PresenseList) => {
      this.stream.series = [this.toSeriesData(presense)];
      if (this.observer) {
        this.observer(this.stream);
      }
    },
  };

  toSeriesData(presense: PresenseList): SeriesData {
    const series: SeriesData = {
      refId: this.query.refId,
      fields: [
        {name: 'id', type: FieldType.string},
        {name: 'first_time', type: FieldType.time},
        {name: 'first_action', type: FieldType.string},
        {name: 'last_time', type: FieldType.time},
        {name: 'last_action', type: FieldType.string},
        {name: 'who_login', type: FieldType.string},
      ],
      rows: [],
    };

    for (const p of presense.results) {
      series.rows.push([
        p.id,
        p.first.time,
        p.first.action,
        p.last.time,
        p.last.action,
        p.who.login,
      ]);
    }

    return series;
  }
}
