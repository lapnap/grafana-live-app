import React from 'react';
import ReactDOM from 'react-dom';
import { LiveApp } from '../app/LiveApp';
import { PresenceWidget } from './PresenceWidget';

export class LapnapWidgets {
  readonly sess: HTMLDivElement;

  constructor(private app: LiveApp) {
    this.sess = document.createElement('div');
    document.body.append(this.sess);
    setTimeout(() => {
      this.renderSession();
    }, 25);
  }

  renderSession = () => {
    ReactDOM.render(<PresenceWidget app={this.app} />, this.sess);
  };
}
