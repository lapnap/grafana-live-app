import React from 'react';
import {shallow} from 'enzyme';
import {ShowPresense, Props} from './ShowPresense';
import {app} from 'app/LiveApp';

const setup = (propOverrides?: object) => {
  const props: Props = {
    app,
  } as Props; // partial

  (props.app as any).uid = 'XXX';

  Object.assign(props, propOverrides);

  const wrapper = shallow(<ShowPresense {...props} />);
  const instance = wrapper.instance() as ShowPresense;

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
