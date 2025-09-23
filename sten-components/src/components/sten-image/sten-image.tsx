import { Component, Host, h, Prop, Element, State, Watch, Listen } from '@stencil/core';
import { BEM, objectFitPolyfill, throttled } from '@learnD3/base'

@Component({
  tag: 'sten-image',
  styleUrl: 'sten-image.scss',
  shadow: true,
})
export class StenImage {
  /** src 图片路径 */
  @Prop() src: string;
  /** lazy 是否懒加载 */
  @Prop() lazy: boolean = false;
  /** 图片填充模式 */
  @Prop() fit: 'none' | 'contain' | 'cover' | 'fill' | 'scale-down' = 'none';
  /** 加载文案 */
  @Prop() placeholder = '加载中';
  /** 错误文案 */
  @Prop() errorText = '加载失败';

  @Element() element: HTMLElement;

  @State() loading = true;
  @State() error = false;
  @State() imageWidth: number;
  @State() imageHeight: number;
  @State() show = false;

  private _scrollContainer: HTMLElement | (Window & typeof globalThis);
  private _handleLazyLoad: any;
  @Listen('scroll', { target: 'window',capture: true })
  handleScroll(){
    if(!this.lazy) return 
    this._handleLazyLoad()
  }
  loadImg() {
    if (!this.src) return
    this.loading = true
    this.error = false
    const img = new Image()
    img.onload = (e) => this.handleLoad(e, img)
    img.onerror = this.handleError.bind(this)
  }

  handleLoad(e: Event, image: HTMLImageElement) {
    this.imageWidth = image.width;
    this.imageHeight = image.height;
    this.loading = false;
    this.error = false;
  }

  handleError(error: OnErrorEventHandlerNonNull) {
    this.loading = false
    this.error = true
  }



  componentWillLoad() {
    console.log('objectFitPolyfill', objectFitPolyfill);
    console.log(this.element)
    if (!this.lazy) {
      this.loadImg()
    }
    
    // this._handleLazyLoad = 
    // const b = new BEM('image')
    // console.log("🚀 ~ StenImage ~ componentWillLoad ~ b:", b)
  }

  render() {
    let { loading, error, errorText, placeholder, src } = this
    const bem = new BEM('image')
    return (
      <Host class={bem.B()}>
        {!loading && !error && <img src={src} class={bem.M('inner')}></img>}
        {loading && <div class={bem.M('placeholder')}>{placeholder}</div>}
        {error && <div class={bem.M('errorText')}>{errorText}</div>}
      </Host>
    );
  }
}
