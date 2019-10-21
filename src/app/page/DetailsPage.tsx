// Libraries
import React, { PureComponent, Fragment } from 'react';
import ReactJson from 'react-json-view';

// Types
import { AppRootProps } from '@grafana/ui';
import { AppOptions, SessionDetails, PresenseKey } from 'types';
import { app } from 'app/LiveApp';
import { navigateToPath } from 'feature/Navigation';
import { PresenseList } from 'feature/PresenseWatcher';

interface Props extends AppRootProps<AppOptions> {}
interface State {
  details?: PresenseList;
}

export const DetailsPageID = 'details';

export class DetailsPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.doQuery();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.query !== prevProps.query) {
      this.doQuery();
    }
  }

  doQuery = async () => {
    await app.getLiveSocket(1000);
    if (!app.ds) {
      return;
    }
    const { query } = this.props;

    const g = query.g as PresenseKey;
    const id = query.id as string;
    if (!g || !id) {
      console.log('Missing parameters');
      return;
    }

    this.setState({
      details: await app.ds.getEventDetais(g, id),
    });
  };

  onClick = (g: PresenseKey, id: string) => {
    navigateToPath('a/lapnap-live-app', {
      page: DetailsPageID,
      id,
      g,
    });
  };

  renderDetails(details: SessionDetails) {
    const { keys, start, ...rest } = details;
    return (
      <div key={keys.session}>
        <div>
          ({keys.session}) {start}
        </div>
        <div>
          {Object.keys(keys).map(s => {
            const key = s as PresenseKey; // typescript
            const v = keys[key];
            return (
              <a key={key} className="btn btn-inverse" onClick={() => this.onClick(key, v)} href="#">
                {key}
              </a>
            );
          })}
        </div>
        <ReactJson src={rest} collapsed={true} theme="monokai" name={null} displayDataTypes={false} displayObjectSize={false} />
      </div>
    );
  }

  render() {
    const { details } = this.state;
    if (!details) {
      return <div>???</div>;
    }

    return (
      <div>
        <table className="filter-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>Key</th>
              <th>Info</th>
            </tr>
          </thead>
          <tbody>
            {details.results.map((item, index) => {
              return (
                <Fragment key={item.id}>
                  <tr>
                    <td colSpan={4}>{this.renderDetails(item.session!)}</td>
                  </tr>
                  {item.events.map((evt, index) => {
                    return (
                      <tr key={`${item.id}.${index}`}>
                        <td>{evt.time}</td>
                        <td>{evt.action}</td>
                        <td>{evt.key}</td>
                        <td>{JSON.stringify(evt.info)}</td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
