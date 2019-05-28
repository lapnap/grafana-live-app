// Libraries
import React, {PureComponent, CSSProperties} from 'react';

import {Unsubscribable, PartialObserver} from 'rxjs';

// Types
import {PresenseList} from 'feature/PresenseWatcher';
import {PresenseInfo} from 'types';
import {LiveApp} from 'app/LiveApp';

export interface Props {
  app: LiveApp;
}

interface State {
  presense: PresenseList;
}

export class ShowPresense extends PureComponent<Props, State> {
  subscription?: Unsubscribable;

  constructor(props: Props) {
    super(props);

    this.state = {
      presense: ({} as unknown) as PresenseList,
    };
  }

  componentDidMount() {
    this.subscription = this.props.app.presense.subscribe(this.presenseObserver);
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  presenseObserver: PartialObserver<PresenseList> = {
    next: (presense: PresenseList) => {
      this.setState({presense});
    },
  };

  avatarStyle: CSSProperties = {
    borderRadius: '50%',
    height: 25,
  };

  renderPresense = (p: PresenseInfo) => {
    return (
      <div key={p.id}>
        <img style={this.avatarStyle} src={getAvatarURL(p)} />
        <span>{p.id}</span>XXX
        <div>
          {Object.keys(p.keys).map(key => {
            const vals = p.keys[key];
            if (vals && vals.length > 1) {
              return (
                <span key={key}>
                  {key}: {vals.length}
                </span>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  render() {
    const {presense} = this.state;
    if (!presense || !presense.results) {
      return <div>Presense Not Found</div>;
    }
    return (
      <div>
        {presense.results.map(p => {
          return this.renderPresense(p);
        })}
        <br />
        Grouped By: {presense.groupBy}
      </div>
    );
  }
}

export function getAvatarURL(p: PresenseInfo) {
  if (p.who && p.who.avatar) {
    return p.who.avatar;
  }
  return '/avatar/x-' + p.id;
}
