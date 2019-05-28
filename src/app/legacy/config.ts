import {DataSourceApi} from '@grafana/ui';

export class ConfigCtrl {
  static templateUrl = 'app/legacy/config.html';

  liveDatasources: string[] = [];

  /** @ngInject */
  constructor() {
    const all = window.grafanaBootData.settings.datasources;
    for (const name of Object.keys(all)) {
      const ds = all[name] as DataSourceApi;
      if (ds.meta!.id === 'lapnap-live-datasource') {
        this.liveDatasources.push(name);
      }
    }

    // Set it to the default
    const model = (this as any).appModel;
    if (!model.jsonData) {
      model.jsonData = {};
    }
    if (!model.jsonData.datasource && this.liveDatasources.length) {
      model.jsonData.datasource = this.liveDatasources[0];
    }
    console.log('ConfigCtrlX', this);
  }
}
