import React, {PureComponent, CSSProperties} from 'react';
import {LiveAppProps, QuarumSession} from '../types';

interface State {
  sessions: QuarumSession[];
}

export class SessionsWidget extends PureComponent<LiveAppProps, State> {
  constructor(props: LiveAppProps) {
    super(props);
    this.state = {
      sessions: [],
    };
  }

  componentDidMount() {
    console.log('Mounted');
  }

  componentWillUnmount() {
    console.log('TODO, unsubscribe');
  }

  render() {
    console.log('RENDER!!!!', this);

    const {sessions} = this.state;
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
        Hello!
        {sessions.map((session, index) => {
          return (
            <div key={session.id}>
              {session.who.name} / {session.last!.time}
            </div>
          );
        })}
      </div>
    );
  }
}
