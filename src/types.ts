import {DateTime} from '@grafana/ui';

export interface ViewerState {
  who: string; // will be object
  page: string;
  params: string;
  pageLoaded: DateTime;
  paramsChanged: DateTime;
  sessionStarted: DateTime;
}

export interface QuarmProps {
  others: ViewerState[];
}
