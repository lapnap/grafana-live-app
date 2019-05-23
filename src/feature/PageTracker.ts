import {Subject, PartialObserver, Unsubscribable} from 'rxjs';

export interface PageEvent {
  page: string;
  query?: string;
  isNewPage: boolean;
}

export class PageTracker {
  private prevPage: string = 'x%34/!';
  private href: string = 'x';
  private subject = new Subject<PageEvent>();

  subscribe(observer: PartialObserver<PageEvent>): Unsubscribable {
    return this.subject.subscribe(observer);
  }

  check(url: string) {
    if (this.href !== url) {
      //this.live.update(document.location.href);
      const idx = url.indexOf('?');
      const page = idx > 0 ? url.substring(0, idx) : url;

      const evt: PageEvent = {
        isNewPage: page !== this.prevPage,
        page,
      };
      if (idx > 0) {
        evt.query = url.substring(idx + 1);
      }

      this.prevPage = page;
      this.href = url;

      this.subject.next(evt);
    }
  }

  watchLocationHref(interval: number = 500) {
    window.setInterval(this.watchLocation, interval);
  }

  private watchLocation = () => {
    this.check(document.location.href);
  };
}
