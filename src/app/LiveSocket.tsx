import {EventType, QuarumResponse, QuarumEvent} from 'types';
import {LiveApp} from './LiveApp';

export class LiveSocket {
  private conn?: WebSocket;
  private init?: Promise<WebSocket>;

  constructor(private url: string, private app: LiveApp) {
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
        this.app.setState({
          streaming: true,
          error: undefined,
        });
      };

      ws.onclose = (evt: any) => {
        console.log('Live: websocket onclose', evt);
        this.conn = undefined;
        this.init = undefined;
        reject({message: 'Connection closed'});
        setTimeout(this.reconnect, 2000);
        this.app.setState({
          streaming: false,
        });
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
    const v = JSON.parse(evt.data) as QuarumResponse;
    if (v.error) {
      console.log('ERROR', v.error);
    }
    this.app.sessions.update(v);
    this.app.events.update(v);
  };

  reconnect = () => {
    console.log('TODO... reconnect....');
  };

  //--------------------
  //--------------------

  heartbeat = () => {
    if (this.conn) {
      this.conn.send(
        JSON.stringify({
          action: EventType.Heartbeat,
        })
      );
      setTimeout(this.heartbeat, 15000); // 15seconds
    }
  };

  //--------------------
  //--------------------

  async send(evt: Partial<QuarumEvent>): Promise<boolean> {
    const ws = await this.getConnection();
    ws.send(JSON.stringify(evt));
    return true;
  }
}
