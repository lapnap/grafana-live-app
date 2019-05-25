// Libraries
import React, {PureComponent} from 'react';

import {Unsubscribable, PartialObserver} from 'rxjs';

// Types
import {PresenseOptions} from './types';
import {PanelProps} from '@grafana/ui';
import {PresenseList} from 'feature/PresenseWatcher';
import {plugin as app} from '../../module';
import {PresenseInfo} from 'types';

export interface Props extends PanelProps<PresenseOptions> {}

interface State {
  presense: PresenseList;
}

export class PresencePanel extends PureComponent<Props, State> {
  subscription?: Unsubscribable;

  constructor(props: Props) {
    super(props);

    this.state = {
      presense: ({} as unknown) as PresenseList,
    };
  }

  componentDidMount() {
    this.subscription = app.presense.subscribe(this.presenseObserver);
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
    return (
      <div key={p.id}>
        <img src={p.who.avatar} height={25} /> {p.id}
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
      </div>
    );
  }
}
