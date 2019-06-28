// Libraries
import React, {PureComponent} from 'react';

// Types
import {AppRootProps, NavModelItem} from '@grafana/ui';
import {AppOptions} from 'types';
import {PresensePage, PresensePageID} from './page/PresensePage';
import {DetailsPageID, DetailsPage} from '././page/DetailsPage';

interface Props extends AppRootProps<AppOptions> {}

export class LiveRootPage extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.updateNav();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.query !== prevProps.query) {
      if (this.props.query.tab !== prevProps.query.tab) {
        this.updateNav();
      }
    }
  }

  updateNav() {
    const {path, onNavChanged, query, meta} = this.props;

    // Set the active tab
    let found = false;
    const selected = query.page || PresensePageID;
    const tabs: NavModelItem[] = [];
    tabs.push({
      text: 'Presense',
      icon: 'fa fa-fw fa-file-text-o',
      url: path + '?page=' + PresensePageID,
      id: PresensePageID,
    });

    if (selected === DetailsPageID) {
      tabs.push({
        text: 'Details',
        icon: 'fa fa-fw fa-file-text-o',
        url: path + '?page=' + DetailsPageID,
        id: DetailsPageID,
      });
    }

    for (const tab of tabs) {
      tab.active = !found && selected === tab.id;
      if (tab.active) {
        found = true;
      }
    }
    if (!found) {
      tabs[0].active = true;
    }

    const node = {
      text: 'Lapnap Live',
      img: meta.info.logos.large,
      //   subTitle: 'subtitle here',
      url: path,
      children: tabs,
    };

    // Update the page header
    onNavChanged({
      node: node,
      main: node,
    });
  }

  render() {
    const {path, query} = this.props;

    const selected = query.page || PresensePageID;
    if (selected === PresensePageID) {
      return <PresensePage {...this.props} />;
    } else if (selected === DetailsPageID) {
      return <DetailsPage {...this.props} />;
    }

    return (
      <div>
        QUERY: <pre>{JSON.stringify(query)}</pre>
        <br />
        <ul>
          <li>
            <a href={path + '?x=1'}>111</a>
          </li>
          <li>
            <a href={path + '?x=AAA'}>AAA</a>
          </li>
          <li>
            <a href={path + '?x=1&y=2&y=3'}>ZZZ</a>
          </li>
        </ul>
      </div>
    );
  }
}
