import React, {PureComponent, CSSProperties} from 'react';
import {QuarmProps} from 'types';

export class QuarumWidget extends PureComponent<QuarmProps> {
  render() {
    const {others} = this.props;
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
        {others.map((viewer, index) => {
          return <div key={index}>{viewer.page} /</div>;
        })}
      </div>
    );
  }
}
