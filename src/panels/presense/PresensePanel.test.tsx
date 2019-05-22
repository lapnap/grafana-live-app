import React from 'react';
import {shallow} from 'enzyme';
import {PresencePanel, Props} from './PresencePanel';

const setup = (propOverrides?: object) => {
  const props: Props = {
    height: 300,
    width: 300,
  } as Props; // partial

  Object.assign(props, propOverrides);

  const wrapper = shallow(<PresencePanel {...props} />);
  const instance = wrapper.instance() as PresencePanel;

  return {
    instance,
    wrapper,
  };
};

describe('Render Presense Panel with basic options', () => {
  it('should render', () => {
    const {wrapper} = setup();
    expect(wrapper).toBeDefined();
    expect(wrapper).toMatchSnapshot();
  });
});
