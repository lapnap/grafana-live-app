export class QuarumLive {
  conn?: WebSocket;
  init?: Promise<WebSocket>;
  observers: any;

  constructor(private url: string) {
    this.observers = {};
  }

  getConnection(): Promise<WebSocket> {
    if (this.init) {
      return this.init;
    }

    if (this.conn && this.conn.readyState === 1) {
      return Promise.resolve(this.conn);
    }

    return (this.init = new Promise((resolve, reject) => {
      console.log('connecting...');
      const ws = new WebSocket(this.url);

      ws.onopen = (evt: any) => {
        console.log('opened');
        this.conn = ws;
        this.init = undefined;
        resolve(this.conn);
      };

      ws.onclose = (evt: any) => {
        console.log('Live: websocket onclose', evt);
        this.conn = undefined;
        this.init = undefined;
        reject({message: 'Connection closed'});
        setTimeout(this.reconnect.bind(this), 2000);
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
    console.log('MESSAGE', evt);
  };

  reconnect() {
    console.log('LiveSrv: Reconnecting');
  }

  send(data: any) {
    this.getConnection().then(ws => {
      ws.send(JSON.stringify(data));
    });
  }
}
