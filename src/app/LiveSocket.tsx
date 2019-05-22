import {EventType, QuarumResponse, QuarumEvent} from 'types';
import {LiveApp} from './LiveApp';

export class LiveSocket {
  private conn?: WebSocket;
  private init?: Promise<WebSocket>;

  private first = true;

  constructor(private url: string, private app: LiveApp) {
    // Close the connetion cleanly
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
        this.first = true;
        setTimeout(this.heartbeat, 15000); // 15seconds
        resolve(this.conn);
      };

      ws.onclose = (evt: any) => {
        console.log('Live: websocket onclose', evt);
        this.conn = undefined;
        this.init = undefined;
        reject({message: 'Connection closed'});
        setTimeout(this.reconnect, 2000);
      };

      ws.onerror = (evt: any) => {
        this.init = undefined;
        reject({message: 'Connection error'});
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
    if (this.first) {
      this.first = false;
      const user = window.grafanaBootData.user;
      ws.send(
        JSON.stringify([
          {
            action: EventType.Connect,
            member: {
              id: user.id,
              name: user.email,
              icon: user.gravatarUrl,
            },
            info: {
              window: {
                width:
                  window.innerWidth ||
                  document.documentElement.clientWidth ||
                  document.body.clientWidth,
                height:
                  window.innerHeight ||
                  document.documentElement.clientHeight ||
                  document.body.clientHeight,
              },
              screen: {
                width: window.screen.availWidth,
                height: window.screen.availHeight,
              },
            },
          },
          evt,
        ])
      );
    } else {
      ws.send(JSON.stringify(evt));
    }
    return true;
  }
}
