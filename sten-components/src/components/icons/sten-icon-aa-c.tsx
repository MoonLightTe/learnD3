import { Component, h, Prop } from '@stencil/core';
import { aaC as svgData } from '../sten-icon/icons_esm/index.js';
import { Icon } from '../sten-icon/icon';

@Component({
  tag: 'sten-icon-aa-c',
})
export class StenIconaaC {
  /**
   * icon 尺寸 默认 20
   */
  @Prop() size: number | string = 20;
  /**
   * styles 传入的css样式
   */
  @Prop() styles: object;
  /**
   * 传入的class名称
   */
  @Prop() classNames: string;
  /**
   * 图标颜色
   */
  @Prop() color: string;
  /**
   * 旋转的角度
   */
  @Prop() rotate: number;
  /**
   * 是否自动旋转
   */
  @Prop() spin: boolean;

  render() {
    const { size, styles, classNames, color, rotate, spin } = this;
    console.log(svgData)

    return <Icon {...{ size, styles, classNames, color, rotate, spin, svgData }} />;
  }
}
