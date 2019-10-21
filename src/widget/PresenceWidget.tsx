import React, { PureComponent, CSSProperties } from 'react';
import { LiveAppProps, PresenseInfo, PresenseKey } from '../types';
import { Unsubscribable, PartialObserver } from 'rxjs';
import { LiveAppState } from 'app/LiveApp';
import { PresenseList } from 'feature/PresenseWatcher';
import { navigateToPath } from 'feature/Navigation';
import { getAvatarURL } from 'components/ShowPresense';
import { Tooltip } from '@grafana/ui';

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
    const { app } = this.props;

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
      this.setState({ app });
    },
  };
  presenseObserver: PartialObserver<PresenseList> = {
    next: (presense: PresenseList) => {
      this.setState({ presense });
    },
  };

  renderStatus = () => {
    const { presense } = this.state;
    if (presense && presense.results && presense.results.length) {
      return null; // nothing!
    }

    const wrapStyle: CSSProperties = {
      border: '1px solid grey',
      padding: '4px',
    };

    const { app } = this.state;
    const { connection, error, loading, streaming } = app;
    return (
      <div style={wrapStyle}>
        {connection && <span>{connection.keys.identity}</span>}
        {loading && <i className="fa fa-spinner fa-spin" />}
        {streaming && <i className="fa fa-check-circle" />}
        {error && <span>{error}</span>}
      </div>
    );
  };

  clickPresense = (p: PresenseInfo) => {
    const { presense } = this.state;
    navigateToPath('a/lapnap-live-app', {
      page: 'details',
      id: p.id, // THe detail view
      g: presense.groupBy,
    });
  };

  renderPresenseTooltip = (p: PresenseInfo) => {
    return (
      <div>
        {p.identity && (
          <>
            <div>{p.identity.login}</div>
            <div>{p.identity.email}</div>
          </>
        )}
        {p.keys &&
          Object.keys(p.keys).map(key => {
            const vals = p.keys![key as PresenseKey];
            if (vals && vals.length > 1) {
              return (
                <div key={key}>
                  {key}: {vals.length}
                </div>
              );
            }
            return null;
          })}
      </div>
    );
  };

  renderPresense = () => {
    const { presense } = this.state;
    if (!presense || !presense.results || !presense.results.length) {
      return;
    }

    const wrapStyle: CSSProperties = {
      display: 'flex',
      padding: '2px',
    };

    const avatarStyle: CSSProperties = {
      borderRadius: '50%',
      height: 30,
      width: 30,
      cursor: 'pointer',
    };

    return (
      <>
        {presense.results.map(p => {
          return (
            <div key={p.id} onClick={() => this.clickPresense(p)} style={wrapStyle}>
              <Tooltip content={() => this.renderPresenseTooltip(p)} theme="info" placement="top">
                <img style={avatarStyle} src={getAvatarURL(p)} />
              </Tooltip>
            </div>
          );
        })}
      </>
    );
  };

  render() {
    const style: CSSProperties = {
      zIndex: 99999,
      color: '#888',
      padding: '0px',
      position: 'absolute',
      right: '20px',
      bottom: '20px',
      flexFlow: 'row wrap',
      display: 'flex',
    };
    return (
      <div style={style}>
        {this.renderStatus()}
        {this.renderPresense()}
      </div>
    );
  }
}
