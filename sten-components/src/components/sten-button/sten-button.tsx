import { Component, Host, Method, h } from '@stencil/core';
// import { debounce } from '@learnD3/base'
import { debounce } from '../../../../base/utils/debounce.js'

@Component({
  tag: 'sten-button',
  styleUrl: 'sten-button.css',
  shadow: true,
})
export class StenButton {
  private handleClick = debounce(() => {
    console.trace()
    console.log('1111')
  }, 300)

  render() {
    return (
      <Host>
        <button class="sten-button" onClick={this.handleClick}><slot></slot></button>
      </Host>
    );
  }
}
