import React from 'react';
import ReactDOM from 'react-dom';
import {AppPlugin} from '@grafana/ui';
import {QuarumWidget} from './QuarumWidget';

import {QuarmProps, QuarumSession} from './types';
import {QuarumLive} from './QuarumLive';
import {PartialObserver} from 'rxjs';

export class QuarumApp {
  readonly elem: HTMLDivElement;
  live?: QuarumLive;

  watcher?: any;
  props: QuarmProps = {
    sessions: [],
  };

  constructor(private plugin: AppPlugin) {
    this.elem = document.createElement('div');
    document.body.append(this.elem);

    // Initalize in a little bit
    setTimeout(this.init, 250);
  }

  render = () => {
    ReactDOM.render(<QuarumWidget {...this.props} />, this.elem);
  };

  init = () => {
    // if(!(this.plugin.meta && this.plugin.meta.enabled)) {
    //   console.log('Not Enabled!');
    //   return;
    // }
    console.log('INIT: ', this.plugin.meta);

    this.live = new QuarumLive('ws://localhost:8080/live/');
    this.live.getConnection().then(v => {
      this.watcher = window.setInterval(this.watchLocation, 500);
    });
    this.live.watchSessions;
  };

  sessionWatcher: PartialObserver<QuarumSession[]> = {
    next: (sessions: QuarumSession[]) => {
      this.props = {
        ...this.props,
        sessions,
      };
      this.render();
    },
  };

  href: string = 'x';
  watchLocation = () => {
    if (this.live && this.href !== document.location.href) {
      this.live.update(document.location.href);
      this.href = document.location.href;
    }
  };
}
