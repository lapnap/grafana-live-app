import React from 'react';
import {shallow} from 'enzyme';
import {EventsPanel, Props} from './EventsPanel';

const setup = (propOverrides?: object) => {
  const props: Props = {
    height: 300,
    width: 300,
  } as Props; // partial

  Object.assign(props, propOverrides);

  const wrapper = shallow(<EventsPanel {...props} />);
  const instance = wrapper.instance() as EventsPanel;

  return {
    instance,
    wrapper,
  };
};

describe('Render Events Panel with basic options', () => {
  it('should render', () => {
    const {wrapper} = setup();
    expect(wrapper).toBeDefined();
    expect(wrapper).toMatchSnapshot();
  });
});
