import React from 'react';
import ReactDOM from 'react-dom';
import {LiveApp} from '../LiveApp';
import {SessionsWidget} from './SessionsWidget';

export class LiveWidgets {
  readonly sess: HTMLDivElement;

  constructor(private app: LiveApp) {
    this.sess = document.createElement('div');
    document.body.append(this.sess);
    setTimeout(() => {
      this.renderSession();
    }, 50);
  }

  renderSession = () => {
    ReactDOM.render(<SessionsWidget app={this.app} />, this.sess);
  };
}
