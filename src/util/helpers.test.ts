import {randJSSessionID} from './helpers';

describe('read csv', () => {
  it('sessionID to be defined', () => {
    expect(randJSSessionID).toBeTruthy();
  });
});
