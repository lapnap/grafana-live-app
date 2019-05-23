import {DateTime} from '@grafana/ui';
import {LiveApp} from './app/LiveApp';

export interface AppOptions {
  url: string;
}

export interface LiveAppProps {
  app: LiveApp;
}

//------------------------------------------------------
//
//------------------------------------------------------

export interface QuarmProps {
  sessions: QuarumSession[];
}

//------------------------------------------------------
//
//------------------------------------------------------

export interface QuarumMember {
  id: string;
  name: string;
  icon: string;
}

export interface QuarumEvent {
  session: string; // ID
  action: EventType; //
  key: string; // the path
  time: DateTime;
  info?: {[key: string]: any}; // Depends on event
}

interface FingerprintInfo {
  hash: string;
  browser: string;
  session: string;
}

export interface QuarumSession {
  id: string; //
  who: QuarumMember; // user id
  fingerprint: FingerprintInfo;
  start: DateTime;
  end?: DateTime;
  last?: QuarumEvent;
}

export enum EventType {
  Connect = 'Connect', // Connect to server
  PageLoad = 'PageLoad', // URL Changed
  ParamsChanged = 'ParamsChanged', // Same URL, new params
  Disconnect = 'Disconnect',

  // Not a real event, just keeps the session open
  Heartbeat = 'Heartbeat',
}

export interface QuarumResponse {
  error?: string;
  sessionId?: string;
  events?: QuarumEvent[];
  sessions?: QuarumSession[];
}

//-------------------------
//-------------------------

export interface ConnectionInfo {
  session: QuarumSession;
  socket: string; // URL to live socker server
  token: string; // auth token for socket & events
}
