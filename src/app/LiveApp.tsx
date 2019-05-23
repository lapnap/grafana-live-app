import {AppPlugin, AppPluginMeta} from '@grafana/ui';

import {AppOptions, EventType, QuarumMember} from 'types';
import {LiveSocket} from 'app/LiveSocket';
import {PartialObserver} from 'rxjs';
import {PageTracker, PageEvent} from 'feature/PageTracker';
import {SessionTracker} from 'feature/SessionTracker';
import {LiveWidgets} from 'widget/LapnapWidgets';
import {startNewSession} from 'feature/sessions';

export class LiveApp extends AppPlugin<AppOptions> {
  live?: LiveSocket;
  widgets?: LiveWidgets;

  readonly sessions = new SessionTracker();
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

  render = () => {
    //  ReactDOM.render(<QuarumWidget {...this.props} />, this.elem);
  };

  delayedInit = () => {
    const url = 'http://localhost:8080/';
    const user = window.grafanaBootData.user;
    const member: QuarumMember = {
      id: user.id,
      name: user.email,
      icon: user.gravatarUrl,
    };

    startNewSession(url, member)
      .then(info => {
        console.log('Now start socket with that info', info);
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
