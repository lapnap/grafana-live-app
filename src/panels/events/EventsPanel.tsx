// Libraries
import React, {PureComponent, CSSProperties} from 'react';

// Types
import {EventsOptions} from './types';
import {PanelProps} from '@grafana/ui';
import {CanvasElement, CanvasMouseCallback, MouseEvtType} from './CanvasElement';

export interface Props extends PanelProps<EventsOptions> {}

interface State {
  selection?: CanvasMouseCallback;
}

export class EventsPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  onMouseEvent = (info: CanvasMouseCallback) => {
    let selection: CanvasMouseCallback | undefined = undefined;
    if (info.type === MouseEvtType.drag) {
      selection = info;
    } else if (info.type === MouseEvtType.up) {
      alert('TODO somehow select: ' + info);
    }

    // Force a redraw
    if (this.state.selection !== selection) {
      if (selection) {
        this.setState({selection});
      }
    } else {
      //   console.log( 'MOUSE:', info.type, info.percentX );
    }
  };

  counter = 0;

  draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!ctx) {
      console.warn('WHY?', ctx, width, height);
      return;
    }

    // Clear the background
    ctx.fillStyle = '#FF0';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.font = '14px "Open Sans", Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#000';
    ctx.fillText(`${this.counter}: (${Math.floor(width)}x${Math.floor(height)})`, 10, height / 2);
    this.counter++;
  };

  renderSelection() {
    const {selection} = this.state;
    if (!selection) {
      return;
    }

    const sX = selection.start!.offsetX;
    const cX = selection.offsetX;

    const min = Math.min(sX, cX);
    const max = Math.max(sX, cX);
    const width = Math.max(max - min, 2);

    console.log('SELECTION Changed:', width, min, max);

    const sss: CSSProperties = {
      height: this.props.height,
      border: '2px solid green',
      left: min + 'px',
      width: width + 'px',
      position: 'relative',
    };
    return <div style={sss} />;
  }

  render() {
    const {width, height} = this.props;

    return (
      <div>
        <div
          style={{
            position: 'fixed',
            border: '1px solid red',
            width,
            height,
            pointerEvents: 'none',
          }}
        >
          {this.renderSelection()}
        </div>

        <CanvasElement
          {...this.props}
          width="100%"
          height={25}
          draw={this.draw}
          onMouseEvent={this.onMouseEvent}
        />
      </div>
    );
  }
}
