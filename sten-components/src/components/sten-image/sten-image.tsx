import { Component, Host, h } from '@stencil/core';
import { BEM, objectFitPolyfill } from '@learnD3/base'

@Component({
  tag: 'sten-image',
  styleUrl: 'sten-image.scss',
  shadow: true,
})
export class StenImage {
  componentWillLoad() {
    console.log('objectFitPolyfill', objectFitPolyfill);
    // const b = new BEM('image')
    // console.log("🚀 ~ StenImage ~ componentWillLoad ~ b:", b)
  }

  render() {
    const bem = new BEM('image')
    return (
      <Host class={bem.B()}>
        <slot>image</slot>
      </Host>
    );
  }
}
