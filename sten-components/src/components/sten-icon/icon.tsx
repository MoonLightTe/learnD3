import { h, FunctionalComponent, Host } from '@stencil/core';

interface StenIconProps {
    /**
  
   * icon 尺寸 默认 20
  
   */

    size: number | string;

    /**
  
   * styles 传入的css样式
  
   */

    styles: object;

    /**
  
   * 图标颜色
  
   */

    color: string;

    /**
  
   * 旋转的角度
  
   */

    rotate: number;

    /**
  
   * 是否自动旋转
  
   */

    spin: boolean;

    /**
  
   * 需要渲染的svg数据
  
   */

    svgData: any;

}



interface CSSStyle {
    [key: string]: string;
    color: string;
    transform?: string;
}
interface SvgData {
    name: string;
    attrs: Record<string, string | number>;
    childs?: SvgData[];
    _name?: string;
}

export function convertToSvg(data: SvgData): string {
    const attrsString = Object.entries(data.attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

    if (!data.childs) {
        return `<${data.name} ${attrsString} />`;
    }

    const children = data.childs.map(child => convertToSvg(child)).join('\n  ');
    return `<${data.name} ${attrsString}>\n  ${children}\n</${data.name}>`;
}
export const Icon: FunctionalComponent<StenIconProps> = ({ size, styles, color, rotate, spin, svgData }) => {
    console.log("🚀 ~ Icon ~ color:", color)
    console.log("🚀 ~ Icon ~ svgData:", svgData)
    // 初始化 一个变量，先把 color 扔进去
    const outerStyle: CSSStyle = { color: `#${color}` };

    // 看下 rotate 是否是个合理的取值，如果是的话，把 outerStyle 的 transform 设置好
    if (Number.isSafeInteger(rotate)) {
        outerStyle.transform = `rotate(${rotate}deg)`;
    }

    // 最后把剩下的 styles 变量都加到当前变量
    Object.assign(outerStyle, styles);

    // 解析 svgData 为 JSX 元素
    const renderSvg = (data: SvgData) => {
        const { name, attrs, childs } = data;
        return h(
            name,
            {
                ...attrs,
                width: size,
                height: size,
                style: outerStyle
            },
            childs ? childs.map(child => renderSvg(child)) : []
        );
    };

    return (
        <Host>
            {renderSvg(svgData)}
        </Host>
    );
}