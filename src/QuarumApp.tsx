import React from 'react';
import ReactDOM from 'react-dom';
import {AppPlugin, dateTime} from '@grafana/ui';
import {QuarumWidget} from './QuarumWidget';

import appEvents from 'grafana/app/core/app_events';
import {QuarmProps} from 'types';

export class QuarumApp {
  readonly elem: HTMLDivElement;
  sessionStarted = dateTime(Date.now());
  watcher?: any;
  props: QuarmProps = {
    others: [],
  };

  constructor(private plugin: AppPlugin) {
    console.log('CONSTRUCTOR', plugin.meta);
    this.elem = document.createElement('div');
    document.body.append(this.elem);

    console.log('EVENTS', appEvents);

    // Initalize in a little bit
    setTimeout(this.init, 250);
  }

  render = () => {
    ReactDOM.render(<QuarumWidget {...this.props} />, this.elem);
  };

  init = () => {
    console.log('INIT', this, this.plugin);
    this.watcher = window.setInterval(this.watchLocation, 500);
  };

  navCount = 0;
  href: string = 'x';
  watchLocation = () => {
    if (this.href !== document.location.href) {
      this.href = document.location.href;
      const idx = this.href.indexOf('?');
      this.props.others = [
        ...this.props.others,
        {
          who: 'me',
          sessionStarted: this.sessionStarted,
          page: idx > 0 ? this.href.substring(0, idx) : this.href,
          params: idx > 0 ? this.href.substring(idx + 1) : '',
          pageLoaded: dateTime(Date.now()),
          paramsChanged: dateTime(Date.now()),
        },
      ];
      console.log('Location Changed: ', this.href, this.props);
      this.render();
    }
  };
}
