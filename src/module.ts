import {AppPlugin} from '@grafana/ui';
import {ExamplePage1} from './config/ExamplePage1';
import {ExamplePage2} from './config/ExamplePage2';
import {ExampleRootPage} from './ExampleRootPage';
import {QuarumApp} from './QuarumApp';

// Needed to get an enable/disable button
export {ConfigCtrl} from './legacy/config';

// The React Plugin structure
export const plugin = new AppPlugin()
  .setRootPage(ExampleRootPage)
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

export const quarum = new QuarumApp(plugin);
