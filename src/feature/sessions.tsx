import Fingerprint2 from 'fingerprintjs2';
import {QuarumSession, QuarumMember} from 'types';

const sendToServer: any = {
  language: true,
  timezone: true,
};

interface SessionInfo {
  session: QuarumSession;
  token: string;
  socket: string;
}

// info: {
//   screen: {
//     width: window.screen.availWidth,
//     height: window.screen.availHeight,
//   },
// },

export async function startNewSession(url: string, member: QuarumMember): Promise<SessionInfo> {
  const components = await Fingerprint2.getPromise();
  const info: any = {};
  let entropy = '';
  for (const component of components) {
    if (sendToServer[component.key]) {
      info[component.key] = component.value;
    }
    entropy += component.value + '/';
  }
  info.window = {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height:
      window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
  };

  return (await fetch(
    new Request(url + 'session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member,
        info,
        fingerprint: Fingerprint2.x64hash128(entropy, 31),
      }),
    })
  ).then(response => response.json())) as SessionInfo;
}
