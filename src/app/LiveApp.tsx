import {AppPlugin, AppPluginMeta} from '@grafana/ui';

import {AppOptions, EventType, QuarumMember, ConnectionInfo} from 'types';
import {LiveSocket} from 'app/LiveSocket';
import {PartialObserver, Subject} from 'rxjs';
import {PageTracker, PageEvent} from 'feature/PageTracker';
import {SessionTracker} from 'feature/SessionTracker';
import {LapnapWidgets} from 'widget/LapnapWidgets';
import {startNewSession} from 'feature/sessions';
import {EventTracker} from 'feature/EventTracker';

export interface LiveAppState {
  loading: boolean;
  connection?: ConnectionInfo;
  error?: string;
  streaming: boolean;
}

export class LiveApp extends AppPlugin<AppOptions> {
  live?: LiveSocket;
  widgets?: LapnapWidgets;

  private state: LiveAppState = {
    loading: false,
    streaming: false,
  };

  readonly subject = new Subject<LiveAppState>();
  readonly sessions = new SessionTracker();
  readonly events = new EventTracker();
  readonly pageTracker = new PageTracker();

  init(meta: AppPluginMeta<AppOptions>) {
    if (this.meta) {
      console.log('Already initalized....');
      return;
    }
    if (this.live) {
      console.log('LIVE Already initalized....');
      return;
    }

    // Initalize in a little bit
    setTimeout(this.delayedInit, 250);
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

  delayedInit = () => {
    const url = 'http://localhost:8080/';
    const user = window.grafanaBootData.user;
    const member: QuarumMember = {
      id: user.id,
      name: user.email,
      icon: user.gravatarUrl,
    };

    this.widgets = new LapnapWidgets(this);
    this.setState({loading: true});
    startNewSession(url, member)
      .then(info => {
        this.setState({
          connection: info,
          loading: false,
          error: undefined,
          streaming: false,
        });
        this.live = new LiveSocket('ws://localhost:8080/live/?token=' + info.token, this);
        this.live.getConnection().then(v => {
          this.pageTracker.subscribe(this.pageWatcher);
          this.pageTracker.watchLocationHref(500);
        });
      })
      .catch(err => {
        console.log('Error Starting Session', err);
      });
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
          }
        : {
            action: EventType.ParamsChanged,
            key: evt.page,
            info: {
              query: evt.query,
            },
          };
      this.live.send(msg);
    },
  };
}
