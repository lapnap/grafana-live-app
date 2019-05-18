import {EventType, QuarumSession, QuarumResponse} from './types';
import {Subject, Unsubscribable, PartialObserver} from 'rxjs';

export class QuarumLive {
  private conn?: WebSocket;
  private init?: Promise<WebSocket>;

  private first = true;

  private subject = new Subject<QuarumSession[]>();
  private sessions = new Map<string, QuarumSession>();

  constructor(private url: string) {
    // Close the connetion cleanly
    window.onunload = () => {
      if (this.conn) {
        this.conn.close(200, 'Unload');
      }
    };

    this.subject.subscribe();
  }

  watchSessions(observer: PartialObserver<QuarumSession[]>): Unsubscribable {
    return this.subject.subscribe(observer);
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
    if (v.sessions) {
      for (const sess of v.sessions) {
        if (sess.end) {
          this.sessions.delete(sess.id);
        } else {
          this.sessions.set(sess.id, sess);
        }
      }
    }
    if (v.events) {
      for (const event of v.events) {
        const s = this.sessions.get(event.session);
        if (s) {
          s.last = event;
        }
      }
    }

    //
    const current: QuarumSession[] = [];
    this.sessions.forEach((v, k) => {
      current.push(v);
    });
    this.subject.next(current);
    // SORT??

    console.log('MESSAGE', v);
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

  prevPage: string = 'x%34/!';
  async update(url: string): Promise<boolean> {
    const idx = url.indexOf('?');
    const page = idx > 0 ? url.substring(0, idx) : url;

    const evt: any = {
      action: page === this.prevPage ? EventType.ParamsChanged : EventType.PageLoad,
      key: page,
    };
    if (idx > 0) {
      evt.info = {
        query: url.substring(idx + 1),
      };
    }
    this.prevPage = page;

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
