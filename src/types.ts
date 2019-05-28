import {KeyValue, LoadingState} from '@grafana/ui';
import {LiveApp} from './app/LiveApp';

export interface AppOptions {
  datasource: string;
}

export interface LiveAppProps {
  app: LiveApp;
}

//------------------------------------------------------
//
//------------------------------------------------------

export interface IdentityInfo {
  login: string;
  email: string;
  avatar: string;
}

export interface QuarumEvent {
  sessionId?: string;
  action: EventType | string; //
  key: string; // the path
  time: number;
  info?: KeyValue<any>; // Depends on event
}

export interface SessionKeys {
  session: string; // Created from /start
  fingerprint: string; // Created by javascript fpjs
  browser: string; // Browser Cookie that expires in 90 days
  visit: string; // HTTP Session (cleared when browser closes)
  identity: string; // User identity from the application
}

export enum PresenseKey {
  identity = 'identity',
  session = 'session',
  visit = 'visit',
  browser = 'browser',
  fingerprint = 'fingerprint',
}

export interface PresenseInfo {
  id: string; //
  who: IdentityInfo; // user id

  keys: {[key in PresenseKey]: string[]};

  first: QuarumEvent;
  last: QuarumEvent;
}

export enum EventType {
  Connect = 'Connect', // Connect to server
  PageLoad = 'PageLoad', // URL Changed
  ParamsChanged = 'ParamsChanged', // Same URL, new params
  Disconnect = 'Disconnect',

  // Not a real event, just keeps the session open
  Heartbeat = 'Heartbeat',
}

export interface SessionDetails {
  keys: {[key in PresenseKey]: string};
  start: number;
  info: KeyValue;
  first: QuarumEvent;
  last: QuarumEvent;
}

export interface LiveEventDetails {
  id: string;
  group: PresenseKey;
  sessions: KeyValue<SessionDetails>;
  identity: KeyValue<IdentityInfo>;
  events: QuarumEvent[];
}

//-------------------------
//-------------------------

export interface ConnectionInfo {
  keys: SessionKeys;
  socket: string; // URL to live socker server
  token: string; // auth token for socket & events
}

//-------------------------
//-------------------------

export enum QueryResponseAction {
  Replace = 'Replace', // Replace entire result list
  Update = 'Update', // Find an existing item an update it
  Append = 'Append',
  Remove = 'Remove',
}

export type QueryResponseObserver<T = KeyValue> = (resp: QueryResponse<T>) => void;

export interface QueryResponse<T = {}> {
  id: string;
  state: LoadingState;
  action: QueryResponseAction;
  error?: string;
  value: T;
}

export interface QueryRequest<T = KeyValue> {
  id: string;
  type: string;
  stream?: boolean;
  args: T;
}

export interface LiveRequest<T = KeyValue> {
  event?: Partial<QuarumEvent>;
  query?: QueryRequest<T>;
  cancel?: string;
}
