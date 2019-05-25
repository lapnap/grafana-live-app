import React, {PureComponent, CSSProperties} from 'react';
import {LiveAppProps} from '../types';
import {Unsubscribable, PartialObserver} from 'rxjs';
import {LiveAppState} from 'app/LiveApp';
import {PresenseList} from 'feature/PresenseWatcher';

interface State {
  app: LiveAppState;
  presense: PresenseList;
}

export class PresenceWidget extends PureComponent<LiveAppProps, State> {
  subscriptions: Unsubscribable[] = [];

  constructor(props: LiveAppProps) {
    super(props);
    this.state = {
      app: props.app.getState(),
      presense: ({} as unknown) as PresenseList,
    };
  }

  componentDidMount() {
    const {app} = this.props;

    this.subscriptions.push(app.subject.subscribe(this.appObserver));
    this.subscriptions.push(app.presense.subscribe(this.presenseObserver));
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
  presenseObserver: PartialObserver<PresenseList> = {
    next: (presense: PresenseList) => {
      this.setState({presense});
    },
  };

  renderStatus = () => {
    const {app} = this.state;
    const {connection, error, loading, streaming} = app;
    return (
      <div>
        {connection && <span>{connection.keys.identity}</span>}
        {loading && <i className="fa fa-spinner fa-spin" />}
        {streaming && <i className="fa fa-check-circle" />}
        {error && <span>{error}</span>}
      </div>
    );
  };

  renderPresense = () => {
    const {presense} = this.state;
    if (!presense || !presense.results || !presense.results.length) {
      return;
    }
    return (
      <div>
        {presense.results.map(p => {
          return <div key={p.id}>{p.id}</div>;
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
        {this.renderPresense()}
      </div>
    );
  }
}
