import { Component, h, Host } from '@stencil/core';
import { Icon } from './icon'
import closeSvg from './data/close'

@Component({
  tag: 'sten-icon',
  styleUrl: 'sten-icon.scss',
  shadow: true,
})
export class StenIcon {
  render() {
    return (
      <Icon size="30" rotate={0} styles={{}} color={'2878FF'} svgData={closeSvg} spin={false}></Icon>
    );
  }
}
