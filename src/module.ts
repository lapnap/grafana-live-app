import {ExamplePage1} from 'app/config/ExamplePage1';
import {ExamplePage2} from 'app/config/ExamplePage2';
import {LiveRootPage} from 'app/LiveRootPage';
import {app} from 'app/LiveApp';
import {AppPluginMeta} from '@grafana/ui';
import {AppOptions} from 'types';

// Needed to get an enable/disable button
export {ConfigCtrl} from 'app/legacy/config';

// The React Plugin structure
export const plugin = app; // Avoid circular loop
app
  .setRootPage(LiveRootPage)
  .addConfigPage({
    title: 'Page 1',
    icon: 'fa fa-info',
    body: ExamplePage1,
    id: 'page1',
  })
  .addConfigPage({
    title: 'Page 2',
    icon: 'fa fa-user',
    body: ExamplePage2,
    id: 'page2',
  });

const gui = (window as any).grafanaRuntime;
if (gui) {
  gui.getPluginSettings('lapnap-live-app').then((meta: AppPluginMeta) => {
    gui.importAppPlugin(meta);
  });
} else {
  // HACK!  load the app...
  plugin.init({} as AppPluginMeta<AppOptions>);
}
