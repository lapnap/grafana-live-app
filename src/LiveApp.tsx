import {AppPlugin, AppPluginMeta} from '@grafana/ui';

import {AppOptions, EventType} from './types';
import {LiveSocket} from './LiveSocket';
import {PartialObserver} from 'rxjs';
import Fingerprint2 from 'fingerprintjs2';
import {PageTracker, PageEvent} from './feature/PageTracker';
import {SessionTracker} from './feature/SessionTracker';

export class LiveApp extends AppPlugin<AppOptions> {
  live?: LiveSocket;

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

    // this.elem = document.createElement('div');
    // document.body.append(this.elem);

    // Initalize in a little bit
    setTimeout(this.delayedInit, 250);
  }

  render = () => {
    //  ReactDOM.render(<QuarumWidget {...this.props} />, this.elem);
  };

  delayedInit = () => {
    // if(!(this.plugin.meta && this.plugin.meta.enabled)) {
    //   console.log('Not Enabled!');
    //   return;
    // }
    console.log('INIT: ', this.meta);

    Fingerprint2.get(components => {
      console.log('FINGERPRINT:', components); // an array of components: {key: ..., value: ...}
    });

    this.pageTracker.subscribe(this.pageWatcher);

    this.live = new LiveSocket('ws://localhost:8080/live/', this);
    this.live.getConnection().then(v => {
      this.pageTracker.watchLocationHref(500);
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
