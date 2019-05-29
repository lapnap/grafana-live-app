import {AppPlugin, AppPluginMeta} from '@grafana/ui';

import {AppOptions, EventType, ConnectionInfo, IdentityInfo} from 'types';
import {LiveSocket, LiveSocketState} from 'feature/LiveSocket';
import {PartialObserver, Subject} from 'rxjs';
import {PageTracker, PageEvent} from 'feature/PageTracker';
import {PresenseWatcher} from 'feature/PresenseWatcher';
import {LapnapWidgets} from 'widget/LapnapWidgets';
import {startNewSession} from 'feature/session';
import {LiveDataSource} from 'datasource/LiveDataSource';

export interface LiveAppState {
  loading: boolean;
  connection?: ConnectionInfo;
  error?: string;
  streaming: boolean;
}

export class LiveApp extends AppPlugin<AppOptions> {
  ds?: LiveDataSource;
  live?: LiveSocket;
  widgets?: LapnapWidgets;
  options: AppOptions = {datasource: ''};

  private state: LiveAppState = {
    loading: false,
    streaming: false,
  };

  readonly subject = new Subject<LiveAppState>();
  readonly presense = new PresenseWatcher(this);
  readonly pageTracker = new PageTracker();

  init(meta: AppPluginMeta<AppOptions>) {
    if (this.live) {
      console.log('LIVE Already initalized....');
      return;
    }

    if (meta.jsonData) {
      this.options = meta.jsonData;
    }

    // Initalize in a little bit
    setTimeout(this.delayedInit, 100);
  }

  /**
   * Get the socket when it is avaliable
   */
  getLiveSocket(time: number): Promise<LiveSocket> {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (this.live) {
          resolve(this.live);
          return true;
        }
        if (this.state.error) {
          console.warn('getLiveSocket REJECT', this.state.error);
          reject(this.state.error);
          return true;
        }
        return false;
      };

      if (check()) {
        return;
      }

      let timer: any;
      const sub = this.subject.subscribe({
        next: (s: LiveAppState) => {
          if (check()) {
            window.clearTimeout(timer);
            sub.unsubscribe();
          }
        },
      });

      const start = Date.now();
      timer = window.setTimeout(() => {
        sub.unsubscribe();
        const duration = Date.now() - start;
        if (!check()) {
          console.log('Not ConnectedD', time, duration, this);
          reject('Did not connect within: ' + time);
        }
      }, time);
    });
  }

  getState() {
    return {...this.state};
  }

  setState(update: Partial<LiveAppState>) {
    this.state = {
      ...this.state,
      ...update,
    };
    this.subject.next(this.state);
  }

  delayedInit = async () => {
    this.setState({loading: true});
    this.widgets = new LapnapWidgets(this);

    if (this.options.datasource) {
      try {
        this.ds = await (window as any).grafanaRuntime.datasourceSrv.get(this.options.datasource);
        this.state;
      } catch (err) {}
    }

    const user = window.grafanaBootData.user;
    const member: IdentityInfo = {
      login: user.login,
      email: user.email,
      avatar: user.gravatarUrl,
    };

    if (!this.ds) {
      this.setState({
        loading: false,
        error: 'Live Datasource Not Loaded',
      });
      return;
    }

    startNewSession(this.ds, member)
      .then(info => {
        this.setState({
          connection: info,
          loading: false,
          error: undefined,
          streaming: false,
        });
        this.live = new LiveSocket('ws://localhost:8080/live/?token=' + info.token);
        this.live.subject.subscribe(this.socketWatcher);
        this.live.getConnection().then(v => {
          this.pageTracker.subscribe(this.pageWatcher);
          this.pageTracker.watchLocationHref(500);
        });
      })
      .catch(err => {
        const msg = err.message ? err.message : 'Unable to start session';
        console.log('Error Starting Session', err);
        this.setState({
          connection: undefined,
          loading: false,
          error: msg,
        });
      });
  };

  socketWatcher: PartialObserver<LiveSocketState> = {
    next: (evt: LiveSocketState) => {
      this.setState({
        streaming: evt.streaming,
      });
    },
  };

  // Track any page activity with the server
  pageWatcher: PartialObserver<PageEvent> = {
    next: (evt: PageEvent) => {
      if (!this.live) {
        return;
      }

      const msg = evt.isNewPage
        ? {
            action: EventType.PageLoad,
            key: evt.page,
            info: {
              query: evt.query,
            },
          }
        : {
            action: EventType.ParamsChanged,
            key: evt.page,
            info: {
              query: evt.query,
            },
          };

      this.live.notify(msg);
    },
  };
}

export const app = new LiveApp();
