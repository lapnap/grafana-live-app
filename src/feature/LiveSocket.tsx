import {
  EventType,
  QueryResponse,
  QuarumEvent,
  QueryRequest,
  QueryResponseObserver,
  LiveRequest,
} from 'types';
import {LoadingState} from '@grafana/ui';
import {Subject} from 'rxjs';

export interface LiveSocketState {
  streaming: boolean;
}

export class LiveSocket {
  readonly subject = new Subject<LiveSocketState>();

  private state = {streaming: false};
  private conn?: WebSocket;
  private init?: Promise<WebSocket>;
  private readonly observers = new Map<string, QueryResponseObserver>();

  constructor(private url: string) {
    window.onunload = () => {
      if (this.conn) {
        this.conn.close(200, 'Unload');
      }
    };
  }

  getConnection(): Promise<WebSocket> {
    if (this.init) {
      return this.init;
    }

    if (this.conn && this.conn.readyState === 1) {
      return Promise.resolve(this.conn);
    }

    return (this.init = new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);

      ws.onopen = (evt: any) => {
        console.log('opened');
        this.conn = ws;
        this.init = undefined;
        setTimeout(this.heartbeat, 15000); // 15seconds
        resolve(this.conn);
        this.state = {
          streaming: true,
        };
        this.subject.next(this.state);
      };

      ws.onclose = (evt: any) => {
        console.log('Live: websocket onclose', evt);
        this.conn = undefined;
        this.init = undefined;
        reject({message: 'Connection closed'});
        setTimeout(this.reconnect, 2000);
        this.state = {
          streaming: false,
        };
        this.subject.next(this.state);
      };

      ws.onerror = (evt: any) => {
        this.init = undefined;
        reject({message: 'Error sending event'});
        console.log('Live: websocket error', evt);
      };

      ws.onmessage = this.handleMessage;
    }));
  }

  handleMessage = (evt: MessageEvent) => {
    const v = JSON.parse(evt.data) as QueryResponse;
    if (!v.id) {
      console.error('Response w/o id', v);
      return;
    }

    const observer = this.observers.get(v.id);
    if (!observer) {
      console.error('No observer', v);
      return;
    }
    if (v.state !== LoadingState.Streaming) {
      this.observers.delete(v.id);
    }
    observer(v);
  };

  reconnect = () => {
    console.log('TODO... reconnect....');
  };

  //----------------------------------------
  //----------------------------------------

  heartbeat = () => {
    if (this.conn) {
      this.conn.send(
        JSON.stringify({
          event: {action: EventType.Heartbeat},
        })
      );
      setTimeout(this.heartbeat, 15000); // 15seconds
    }
  };

  //--------------------
  //--------------------

  async notify(event: Partial<QuarumEvent>) {
    return this.send({event});
  }

  async cancel(id: string) {
    this.observers.delete(id);
    return this.send({cancel: id});
  }

  async query(query: QueryRequest<any>, observer: QueryResponseObserver<any>) {
    if (!query.id) {
      throw new Error('Invalid Query.  Needs a unique ID for callback');
    }
    this.observers.set(query.id, observer);
    query.stream = true;
    return this.send({query});
  }

  private async send(req: LiveRequest): Promise<boolean> {
    const ws = await this.getConnection();
    ws.send(JSON.stringify(req));
    return true;
  }
}
