// Libraries
import React, {PureComponent} from 'react';

import {Unsubscribable, PartialObserver} from 'rxjs';

// Types
import {PresenseList} from 'feature/PresenseWatcher';
import {PresenseInfo} from 'types';
import {LiveApp} from 'app/LiveApp';

interface Props {
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

  renderPresense = (p: PresenseInfo) => {
    const avatar = p.who.avatar ? p.who.avatar : '/avatar/x-' + p.id;

    return (
      <div key={p.id}>
        <img className="icon-circle" src={avatar} height={25} />
        <span>{p.id}</span>
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
