// Libraries
import React, {PureComponent, CSSProperties} from 'react';

// Types
import {EventsOptions} from './types';
import {
  PanelProps,
  dateTime,
  colors,
  RawTimeRange,
  TimeRange,
  Select,
  SelectOptionItem,
} from '@grafana/ui';
import {CanvasElement, CanvasMouseCallback, MouseEvtType} from './CanvasElement';
import {PresenseList, LongerList} from 'feature/PresenseWatcher';
import {Unsubscribable, PartialObserver} from 'rxjs';
import {app} from 'app/LiveApp';
import {PresenseInfo, EventType, PresenseKey, QuarumEvent} from 'types';
import {zoomToTimeRange} from 'feature/Navigation';
import {getAvatarURL} from 'components/ShowPresense';

export interface Props extends PanelProps<EventsOptions> {}

interface QuarumEventEx extends QuarumEvent {
  x: number; // pixels
  percent: number; // 0-1
}

interface EventDataList extends LongerList<PresenseInfo<QuarumEventEx>> {
  id?: String;
  groupBy: PresenseKey;
  timeRange: RawTimeRange;
  hover?: number;
}

interface State {
  selection?: CanvasMouseCallback;
  groupBy?: PresenseKey;
  info?: EventDataList;
  id?: string;

  // Current Presense Results
  current?: PresenseList;
}

export class EventsPanel extends PureComponent<Props, State> {
  subscription?: Unsubscribable;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    this.subscription = app.presense.subscribe(this.presenseObserver);
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async componentDidUpdate(prevProps: Props, prevState: State) {
    const {timeRange, width} = this.props;
    const {id, groupBy} = this.state;

    let needsUpdate = false;
    if (
      timeRange !== prevProps.timeRange ||
      width !== prevProps.width ||
      id !== prevState.id ||
      groupBy != prevState.groupBy
    ) {
      needsUpdate = true;
    }

    // Update our view of the data
    if (needsUpdate) {
      let input = this.state.current;
      if (groupBy && app.ds) {
        input = await app.ds.getEventDetais(groupBy, id);
      }
      if (input) {
        this.setState({
          info: toEventDataList(input, timeRange, width),
        });
      }
    }
  }

  presenseObserver: PartialObserver<PresenseList> = {
    next: (presense: PresenseList) => {
      if (this.state.id) {
        this.setState({current: presense});
        return;
      }
      const {timeRange, width} = this.props;
      this.setState({
        info: toEventDataList(presense, timeRange, width),
        current: presense,
      });
    },
  };

  onMouseEvent = (info: CanvasMouseCallback<PresenseInfo<QuarumEventEx>>) => {
    let selection: CanvasMouseCallback | undefined = undefined;
    let hover: number | undefined = undefined;
    const {type, data, start, offsetX, percentX} = info;

    // Find the hover item
    if (data && type !== MouseEvtType.leave && data.events) {
      for (let i = 0; i < data.events.length; i++) {
        const evt = data.events[i];
        if (evt.x >= offsetX) {
          hover = i;
        } else if (evt.x < offsetX) {
          break;
        }
      }
    }

    if (type === MouseEvtType.drag) {
      selection = info;
    } else if (type === MouseEvtType.up) {
      const {timeRange} = this.props;
      const min = timeRange.from.valueOf();
      const size = timeRange.to.valueOf() - min;
      const t1 = min + percentX * size;

      if (!start) {
        return;
      }

      // Moved less than 5pixels
      if (Math.abs(offsetX - start!.offsetX) < 5) {
        alert('Clicked:' + t1);
      } else {
        const t0 = min + start!.percentX * size;
        zoomToTimeRange({
          from: dateTime(Math.min(t0, t1)),
          to: dateTime(Math.max(t0, t1)),
        });
      }
    }

    // Force a redraw
    if (this.state.selection !== selection) {
      this.setState({selection});
    }
  };

  draw = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    info: PresenseInfo<QuarumEventEx>
  ) => {
    // Clear the background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.font = '14px "Open Sans", Helvetica, Arial, sans-serif';

    if (!info.events) {
      ctx.fillStyle = '#d8d9da';
      ctx.fillText(`No events`, 10, height / 2);
    }

    const barheight = height / 2;
    const textColor = '#d8d9da';
    let idx = 0;
    for (const event of info.events) {
      ctx.fillStyle = colors[++idx % colors.length];

      let x = event.x;
      if (x < 0) {
        x = 0;
        // TODO, add a note?
      }

      if (event.action === EventType.ParamsChanged) {
        ctx.fillRect(x, barheight, width, height - barheight);

        ctx.fillStyle = textColor;
        let txt = '';
        if (event.info && event.info.query) {
          txt = event.info.query;
        }

        ctx.textBaseline = 'bottom';
        ctx.fillText(txt, x + 5, height - 6);
      } else {
        ctx.fillRect(x, 0, width, height);

        ctx.fillStyle = textColor;
        let text = event.action;
        if (event.action === EventType.PageLoad) {
          if (event.info && event.info.query) {
            text = event.info.query;
            ctx.textBaseline = 'bottom';
            ctx.fillText(text, x + 5, height - 6);
          }

          text = event.key;
        }
        ctx.textBaseline = 'top';
        ctx.fillText(text, x + 5, 6);
      }
    }
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

    const sss: CSSProperties = {
      height: this.props.height,
      border: '2px solid green',
      left: min + 'px',
      width: width + 'px',
      position: 'relative',
    };
    return <div style={sss} />;
  }

  renderKeysInfo(p: PresenseInfo) {
    if (!p.keys) {
      return;
    }
    return (
      <div style={{float: 'right'}}>
        &nbsp;&nbsp;
        {Object.keys(p.keys).map(key => {
          const vals = p.keys![key as PresenseKey];
          if (vals && vals.length > 1) {
            return (
              <button
                className="btn btn-small btn-inverse"
                key={key}
                onClick={() => this.setState({groupBy: key as PresenseKey})}
              >
                {key}: {vals.length}
              </button>
            );
          }
          return null;
        })}
      </div>
    );
  }

  onGroupByChange = (item: SelectOptionItem<PresenseKey>) => {
    this.setState({groupBy: item.value, id: undefined});
  };

  renderControls() {
    const items = Object.keys(PresenseKey).map(k => {
      return {
        value: k as PresenseKey,
        label: k,
      };
    });
    items.push({
      value: (undefined as unknown) as PresenseKey,
      label: '-- group by --',
    });

    return (
      <div style={{width: '100%'}}>
        <div style={{float: 'right'}}>
          <button
            className="btn btn-inverse"
            onClick={() => {
              const v = this.state.info!.timeRange;
              zoomToTimeRange({
                from: v.from,
                to: 'now',
              });
            }}
          >
            Zoom to full range
          </button>
        </div>

        <div style={{display: 'inline-block'}}>
          <Select
            options={items}
            value={items.find(i => i.value === this.state.groupBy)}
            onChange={this.onGroupByChange}
            placeholder="group by"
          />
        </div>
        {this.state.id && (
          <button
            className="btn btn-inverse"
            onClick={() => {
              this.setState({groupBy: undefined, id: undefined});
            }}
          >
            {this.state.id}
          </button>
        )}
      </div>
    );
  }

  avatarStyle: CSSProperties = {
    borderRadius: '50%',
    height: 15,
    marginRight: '5px',
  };

  render() {
    const {width, height} = this.props;
    const {info} = this.state;
    if (!info || !info.results) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <div
          style={{
            position: 'fixed',
            width,
            height,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: height - 40,
                width: '100%',
                pointerEvents: 'all',
                height: 40,
                background: '#212124',
              }}
            >
              {this.renderControls()}
            </div>
          </div>
          {this.renderSelection()}
        </div>
        <div
          style={{
            overflow: 'scroll',
            height: height - 45,
          }}
        >
          {info.results.map(item => {
            return (
              <div key={item.id}>
                <div style={{cursor: 'pointer'}}>
                  {item.identity && (
                    <span
                      onClick={() => {
                        this.setState({
                          groupBy: PresenseKey.identity,
                          id: item.identity!.login,
                        });
                      }}
                    >
                      <img style={this.avatarStyle} src={getAvatarURL(item)} />
                      {item.identity!.login !== item.id && <span>{item.identity!.login}: </span>}
                    </span>
                  )}
                  <span
                    onClick={() => {
                      this.setState({
                        groupBy: info.groupBy,
                        id: item.id,
                      });
                    }}
                  >
                    {item.id}
                  </span>
                  {app.isCurrentSession(info.groupBy, item.id) && <span>(current)</span>}

                  {this.renderKeysInfo(item)}
                </div>

                <CanvasElement
                  {...this.props}
                  data={item}
                  width="100%"
                  height={50}
                  draw={this.draw}
                  onMouseEvent={this.onMouseEvent}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

function toEventDataList(
  presense: PresenseList,
  timeRange: TimeRange,
  width: number
): EventDataList {
  const min = timeRange.from.valueOf();
  const size = timeRange.to.valueOf() - min;

  const val: PresenseInfo<QuarumEventEx>[] = presense.results.map(p => {
    const sorted = p.events.map(evt => {
      const percent = (evt.time - min) / size;
      return {
        ...evt,
        percent,
        x: width * percent,
      } as QuarumEventEx;
    });
    sorted.sort((a, b) => {
      return a.time - b.time;
    });
    return {
      ...p,
      events: sorted,
    };
  });

  return {
    ...presense,
    timeRange: getTimeRange(presense),
    results: val,
  };
}

function getTimeRange(presense: PresenseList): RawTimeRange {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  if (presense && presense.results) {
    for (const info of presense.results) {
      if (!info.events) {
        continue;
      }
      for (const evt of info.events) {
        if (evt.time > max) {
          max = evt.time;
        }
        if (evt.time < min) {
          min = evt.time;
        }
      }
    }
  }

  if (min === Number.NEGATIVE_INFINITY) {
    max = Date.now();
    min = max - 6000 * 5; // 5 min
  }
  return {
    from: dateTime(min),
    to: dateTime(max),
  };
}
