import React, {PureComponent, CSSProperties} from 'react';
import {LiveAppProps, QuarumSession} from '../types';
import {Unsubscribable, PartialObserver} from 'rxjs';
import {LiveAppState} from 'app/LiveApp';

interface State {
  app: LiveAppState;
  sessions: QuarumSession[];
}

export class SessionsWidget extends PureComponent<LiveAppProps, State> {
  subscriptions: Unsubscribable[] = [];

  constructor(props: LiveAppProps) {
    super(props);
    this.state = {
      app: props.app.getState(),
      sessions: [],
    };
  }

  componentDidMount() {
    const {app} = this.props;
    this.subscriptions.push(app.subject.subscribe(this.appObserver));
    this.subscriptions.push(app.sessions.subscribe(this.sessObserver));
  }

  componentWillUnmount() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
    this.subscriptions = [];
  }

  // Track any page activity with the server
  appObserver: PartialObserver<LiveAppState> = {
    next: (app: LiveAppState) => {
      this.setState({app});
    },
  };
  sessObserver: PartialObserver<QuarumSession[]> = {
    next: (sessions: QuarumSession[]) => {
      this.setState({sessions});
    },
  };

  renderStatus = () => {
    const {app} = this.state;
    const {connection, error, loading, streaming} = app;
    return (
      <div>
        {connection && <span>{connection.session.who.name}</span>}
        {loading && <i className="fa fa-spinner fa-spin" />}
        {streaming && <i className="fa fa-check-circle" />}
        {error && <span>{error}</span>}
      </div>
    );
  };

  renderSessions = () => {
    const {sessions} = this.state;
    if (!sessions || !sessions.length) {
      return;
    }
    return (
      <div>
        {sessions.map((session, index) => {
          return <div key={session.id}>{session.fingerprint.browser}</div>;
        })}
      </div>
    );
  };

  render() {
    const style: CSSProperties = {
      zIndex: 99999,
      color: '#888',
      padding: '5px',
      border: '1px solid grey',
      background: '#000',
      position: 'absolute',
      right: '10px',
      bottom: '10px',
    };
    return (
      <div style={style}>
        {this.renderStatus()}
        {this.renderSessions()}
      </div>
    );
  }
}
