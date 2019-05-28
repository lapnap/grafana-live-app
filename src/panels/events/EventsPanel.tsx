// Libraries
import React, {PureComponent} from 'react';

// Types
import {EventsOptions} from './types';
import {PanelProps} from '@grafana/ui';
import {CanvasElement} from './CanvasElement';

export interface Props extends PanelProps<EventsOptions> {}

interface State {
  html: string;
}

export class EventsPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      html: 'xxxx',
    };
  }

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

  // viewbox: <min-x> <min-y> <width> <height>
  render() {
    return (
      <div>
        TODO! show events.
        <br />
        <CanvasElement {...this.props} width="100%" height={25} draw={this.draw} />
      </div>
    );
  }
}
