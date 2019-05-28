// Libraries
import React, {PureComponent} from 'react';
import ReactJson from 'react-json-view';

// Types
import {AppRootProps} from '@grafana/ui';
import {AppOptions, SessionDetails, PresenseKey} from 'types';
import {app} from 'app/LiveApp';
import {navigateToPath} from 'feature/Navigation';

interface Props extends AppRootProps<AppOptions> {}
interface State {
  details: SessionDetails[];
}

export const DetailsPage_ID = 'details';

export class DetailsPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      details: [],
    };
    this.doQuery();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.query !== prevProps.query) {
      this.doQuery();
    }
  }

  doQuery = async () => {
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
      details: await app.ds.getSessionDetais(g, id),
    });
  };

  onClick = (g: PresenseKey, id: string) => {
    navigateToPath('a/lapnap-live-app', {
      page: DetailsPage_ID,
      id,
      g,
    });
  };

  renderDetails(details: SessionDetails, index: number) {
    const {keys, start, ...rest} = details;
    return (
      <div key={index + 'A'}>
        <div>
          ({index} / {this.state.details.length}) {start}
        </div>
        <div>
          {Object.keys(keys).map(s => {
            const key = s as PresenseKey; // typescript
            const v = keys[key];
            return (
              <a className="btn btn-inverse" onClick={() => this.onClick(key, v)} href="#">
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
    if (!details || !details.length) {
      return <div>???</div>;
    }

    return (
      <div>
        {details.map((d, index) => {
          return this.renderDetails(d, index);
        })}
      </div>
    );
  }
}
