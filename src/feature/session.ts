import Fingerprint2 from 'fingerprintjs2';
import {IdentityInfo, ConnectionInfo} from 'types';
import {LiveDataSource} from 'datasource/LiveDataSource';

const sendToServer: any = {
  language: true,
  timezone: true,
  platform: true,
  hardwareConcurrency: true,
};

export async function startNewSession(
  ds: LiveDataSource,
  identity: IdentityInfo
): Promise<ConnectionInfo> {
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
  info.screen = {
    width: window.screen.availWidth,
    height: window.screen.availHeight,
  };

  return await fetch(
    new Request(ds.getStartSessionUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity,
        info,
        fingerprint: Fingerprint2.x64hash128(entropy, 31),
      }),
    })
  ).then(async response => {
    if (response.status === 200) {
      return (await response.json()) as ConnectionInfo;
    }
    if (response.status === 404) {
      throw new Error('Server Not Running');
    }
    console.error('Error Starting Session: ', response);
    throw new Error('Unable To Start Session');
  });
}
