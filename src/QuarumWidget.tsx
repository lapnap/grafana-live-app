import React, {PureComponent, CSSProperties} from 'react';
import {QuarmProps} from 'types';

export class QuarumWidget extends PureComponent<QuarmProps> {
  render() {
    const {sessions} = this.props;
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
