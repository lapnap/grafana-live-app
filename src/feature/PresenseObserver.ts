import {Subject, PartialObserver, Unsubscribable} from 'rxjs';
import {PresenseInfo, QueryResponse, PresenseKey, QueryResponseAction} from 'types';
import {randomId} from 'util/helpers';
import {LiveApp} from 'app/LiveApp';

export class PresenseObserver {
  readonly qid = randomId();

  private subject = new Subject<PresenseInfo[]>();

  private current: PresenseInfo[] = [];
  private groupBy: PresenseKey = PresenseKey.identity;

  constructor(private app: LiveApp) {}

  subscribe(observer: PartialObserver<PresenseInfo[]>): Unsubscribable {
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

  queryObserver = (v: QueryResponse<PresenseInfo | PresenseInfo[]>) => {
    let current: PresenseInfo[] = [];
    if (v.action === QueryResponseAction.Replace) {
      current = v.value as PresenseInfo[];
    } else if (v.action === QueryResponseAction.Remove) {
      console.log('REMOVE', v.value);
    } else {
      const add = v.value as PresenseInfo;
      current = this.current.filter(p => p.id !== add.id);
      current.push(add);
    }
    this.current = current;

    if (this.subject.observers.length) {
      this.subject.next(this.current);
    }
    // If noone is listening, just cancel
    else if (this.app.live) {
      this.app.live.cancel(this.qid);
    }
  };
}
