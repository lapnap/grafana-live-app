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

//------------------------------------------------------
//
//------------------------------------------------------

export interface QuarumSession {
  uid: string; //
  who: string; // user id
  info: {[key: string]: any}; // User agent etc?
  start: DateTime;
  end?: DateTime;
}

export enum EventType {
  Connect = 'Connect', // Connect to server
  PageLoad = 'PageLoad', // URL Changed
  ParamsChanged = 'ParamsChanged', // Same URL, new params
  Disconnect = 'Disconnect',
}

export interface QuarumEvent {
  session: string; // Unique for each session
  type: EventType; //
  time: DateTime;
  key: string; // the path
  info: {[key: string]: any}; // Depends on event
}
