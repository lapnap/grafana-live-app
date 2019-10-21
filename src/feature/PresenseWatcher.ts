import { Subject, PartialObserver, Unsubscribable } from 'rxjs';
import { PresenseInfo, QueryResponse, PresenseKey, QueryResponseAction } from 'types';
import { randomId } from 'util/helpers';
import { LiveApp } from 'app/LiveApp';

export interface LongerList<T> {
  start?: number;
  found?: number;
  results: T[];
}

export interface PresenseList extends LongerList<PresenseInfo> {
  id?: string;
  groupBy: PresenseKey;
}

export class PresenseWatcher {
  readonly qid = randomId();

  private subject = new Subject<PresenseList>();

  private groupBy: PresenseKey = PresenseKey.identity;
  private current: PresenseList = { groupBy: PresenseKey.identity, results: [] };

  constructor(private app: LiveApp) {}

  subscribe(observer: PartialObserver<PresenseList>): Unsubscribable {
    this.sendQuery();
    observer.next!(this.current);
    return this.subject.subscribe(observer);
  }

  sendQuery = () => {
    this.app.getLiveSocket(500).then(socket => {
      socket.query(
        {
          id: this.qid,
          type: 'presense',
          args: {
            groupBy: this.groupBy,
          },
        },
        this.queryObserver
      );
    });
  };

  queryObserver = (v: QueryResponse<PresenseList>) => {
    const current = v.value;
    if (v.action === QueryResponseAction.Remove) {
      console.log('REMOVE', v.value);
    }
    //  else {
    //   const add = v.value as PresenseInfo;
    //   current = this.current.filter(p => p.id !== add.id);
    //   current.push(add);
    // }
    this.current = current;

    if (this.subject.observers.length) {
      this.subject.next(this.current);
    } else if (this.app.live) {
      this.app.live.cancel(this.qid);
    }
  };
}
