import {Subject, PartialObserver, Unsubscribable} from 'rxjs';
import {QuarumSession} from '../types';
import {QuarumResponse} from '../types';

export class SessionTracker {
  private subject = new Subject<QuarumSession[]>();
  readonly sessions = new Map<string, QuarumSession>();

  subscribe(observer: PartialObserver<QuarumSession[]>): Unsubscribable {
    return this.subject.subscribe(observer);
  }

  update(v: QuarumResponse) {
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

    // Get a list of the active ones
    const current: QuarumSession[] = [];
    this.sessions.forEach((v, k) => {
      current.push(v);
    });
    this.subject.next(current);
  }
}
