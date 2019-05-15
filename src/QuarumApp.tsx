import React from 'react';
import ReactDOM from 'react-dom';
import {AppPlugin} from '@grafana/ui';
import {QuarumWidget} from './QuarumWidget';

import appEvents from 'grafana/app/core/app_events';
import {QuarmProps, EventType} from './types';

export class QuarumApp {
  readonly elem: HTMLDivElement;
  sessionId?: string;

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
    const data = {
      hello: 'world',
      agent: 'SOMEHTING',
    };

    fetch('http://localhost:8080/events/start/zzzz', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    }).then(response => {
      response.json().then((v: any) => {
        console.log('GOT', v);
        this.sessionId = v.session;

        this.watcher = window.setInterval(this.watchLocation, 500);
      });
    });
  };

  prevPage: string = 'x';
  href: string = 'x';
  watchLocation = () => {
    if (this.href !== document.location.href) {
      const href = document.location.href;
      const idx = href.indexOf('?');
      const page = idx > 0 ? href.substring(0, idx) : href;

      const event: any = {
        session: this.sessionId,
        action: page === this.prevPage ? EventType.ParamsChanged : EventType.PageLoad,
        key: page,
      };
      if (idx > 0) {
        event.info = {
          query: href.substring(idx + 1),
        };
      }

      this.href = href;
      this.prevPage = page;

      fetch('http://localhost:8080/events/add', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(event), // body data type must match "Content-Type" header
      }).then(response => {
        console.log('GOT', response.status);
      });

      console.log('Location Changed: ', this.href, this.props);
      this.render();
    }
  };
}
