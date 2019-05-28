// Libraries
import React, {PureComponent} from 'react';
import ReactJson from 'react-json-view';

// Types
import {AppRootProps} from '@grafana/ui';
import {AppOptions, SessionDetails, PresenseKey, LiveEventDetails} from 'types';
import {app} from 'app/LiveApp';
import {navigateToPath} from 'feature/Navigation';

interface Props extends AppRootProps<AppOptions> {}
interface State {
  details?: LiveEventDetails;
}

export const DetailsPage_ID = 'details';

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
    const {query} = this.props;

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
      page: DetailsPage_ID,
      id,
      g,
    });
  };

  renderDetails(details: SessionDetails) {
    const {keys, start, ...rest} = details;
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
              <a
                key={key}
                className="btn btn-inverse"
                onClick={() => this.onClick(key, v)}
                href="#"
              >
                {key}
              </a>
            );
          })}
        </div>
        <ReactJson
          src={rest}
          collapsed={true}
          theme="monokai"
          name={null}
          displayDataTypes={false}
          displayObjectSize={false}
        />
      </div>
    );
  }

  render() {
    const {details} = this.state;
    if (!details) {
      return <div>???</div>;
    }

    return (
      <div>
        <div>
          {Object.keys(details.sessions).map(key => {
            return this.renderDetails(details.sessions[key]);
          })}
        </div>
        <table className="filter-table">
          <thead>
            <th>Session</th>
            <th>Action</th>
            <th>Key</th>
            <th>Info</th>
          </thead>
          <tbody>
            {details.events.map(evt => {
              return (
                <tr>
                  <td>{evt.sessionId}</td>
                  <td>{evt.action}</td>
                  <td>{evt.key}</td>
                  <td>{evt.info}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
