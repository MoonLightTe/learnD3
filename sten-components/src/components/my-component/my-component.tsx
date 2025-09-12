import { Component, Prop, State, h } from '@stencil/core';
import { format } from '../../utils/utils';

@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
export class MyComponent {
  @State() num: number = 0;
  /**
   * The first name
   */
  @Prop() first: string;

  /**
   * The middle name
   */
  @Prop() middle: string;

  /**
   * The last name
   */
  @Prop() last: string;

  private getText(): string {
    return format(this.first, this.middle, this.last);
  }

  private addNum = () => {
    console.log(111)
    this.num += 1
  }



  render() {
    return <div><button onClick={this.addNum}>add</button>Hello, World! I'm {this.getText()}, number is {this.num}</div>;
  }
}
