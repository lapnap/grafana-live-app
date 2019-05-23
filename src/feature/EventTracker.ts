import {Subject, PartialObserver, Unsubscribable} from 'rxjs';
import {QuarumEvent} from '../types';
import {QuarumResponse} from '../types';

export class EventTracker {
  private subject = new Subject<QuarumEvent[]>();
  private events: QuarumEvent[] = [];

  subscribe(observer: PartialObserver<QuarumEvent[]>): Unsubscribable {
    return this.subject.subscribe(observer);
  }

  getRecent = () => {
    return this.events;
  };

  update(v: QuarumResponse) {
    const events = [...this.events];
    if (v.events) {
      for (const event of v.events) {
        events.push(event);
      }
    }
    this.events = events;
    this.subject.next(events);
  }
}
