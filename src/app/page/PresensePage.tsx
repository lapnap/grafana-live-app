// Libraries
import React, { PureComponent } from 'react';

// Types
import { AppRootProps } from '@grafana/ui';
import { AppOptions } from 'types';
import { ShowPresense } from 'components/ShowPresense';
import { app } from 'app/LiveApp';

interface Props extends AppRootProps<AppOptions> {}

export const PresensePageID = 'presense';

export class PresensePage extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      <div>
        <ShowPresense app={app} />
      </div>
    );
  }
}
