import { DataQuery, DataSourceJsonData } from '@grafana/ui';

export enum QuerySubject {
  sessions = 'sessions',
  events = 'events',
}

export interface LiveQuery extends DataQuery {
  subject: QuerySubject;
  start?: number;
  limit?: number;
}

export interface LiveOptions extends DataSourceJsonData {
  xxx?: string;
}
