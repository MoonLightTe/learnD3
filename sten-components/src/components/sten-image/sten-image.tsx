import { Component, Host, h, Prop, Element, State, Watch, Listen } from '@stencil/core';
import { BEM, objectFitPolyfill, throttled, isInContainer, getScrollContainer } from '@learnD3/base'

@Component({
  tag: 'sten-image',
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
  @Watch('show')
  watchHandler(_newValue, oldValue) {
    if (oldValue) return;
    this.loadImg();
  }

  @Listen('scroll', { target: 'window', capture: true })
  handleScroll() {
    if (!this.lazy) return
    this._handleLazyLoad()
  }
  loadImg() {
    if (!this.src) return
    this.loading = true
    this.error = false
    const img = new Image()
    console.log("🚀 ~ StenImage ~ loadImg ~ img:", img)
    img.onload = (e) => this.handleLoad(e, img)
    img.onerror = this.handleError.bind(this)
    img.src = this.src
  }

  handleLoad(e: Event, image: HTMLImageElement) {
    console.log("<><><><>")
    this.imageWidth = image.width;
    this.imageHeight = image.height;
    this.loading = false;
    this.error = false;
  }

  handleError(error: OnErrorEventHandlerNonNull) {
    console.log("🚀 ~ StenImage ~ handleError ~ error:", error)
    this.loading = false
    this.error = true
  }

  handleLazyLoad() {
    if (this.show) return;
    if (isInContainer(this.element, this._scrollContainer as HTMLElement)) {
      this.show = true;
    }
  }

  componentWillLoad() {
    // console.log('objectFitPolyfill', objectFitPolyfill);
    console.log(this.element)
    console.log(this.src)
    if (!this.lazy) {
      this.loadImg()
    }

    this._scrollContainer = getScrollContainer(this.element)
    this.handleLazyLoad = this.handleLazyLoad.bind(this);
    this._scrollContainer = getScrollContainer(this.element);
    this._handleLazyLoad = throttled(this.handleLazyLoad, 200);
  }

  render() {
    let { loading, error, errorText, placeholder, src, element, imageHeight, imageWidth, fit } = this
    const bem = new BEM('image')
    const styles = objectFitPolyfill({
      element,
      imageHeight,
      imageWidth,
      fit
    })
    console.log("🚀 ~ StenImage ~ render ~ styles:", styles)
    return (
      <Host style={{ display: 'block' }} class={bem.B()}>
        {!loading && !error && <img src={src} style={styles} class={bem.E('inner')}></img>}
        {loading && <div class={bem.E('placeholder')}>{placeholder}</div>}
        {error && <div class={bem.E('errorText')}>{errorText}</div>}
      </Host>
    );
  }
}
