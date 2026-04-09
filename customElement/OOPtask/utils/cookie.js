console.log(document.cookie);

export class Cookie {
  constructor() {}
}

export class URL {
  constructor(url) {
    this.resetValue()
    this.initUrl(url);
  }

  resetValue(){
    this.href = null
    this.protocol = null
  }

  initUrl(url) {
    this.href = url
    this.protocol = this.getProtocol(url)

  }
  // 提取HASH
  getHash(url){
    if(typeof url !== 'string') return null
    const  idx = url.indexOf('#')
    if(idx === -1) return null
    const fragment = url.slice(idx + 1).replace()
  }
  // 协议
  getProtocol (url){
    // RFC 3986 规范
    // 首字母必须是字符 后面可以是+ . - 字符 数字 0个或多个
    let regexp = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/
    let m = url.match(regexp)
    return m ?  m[1].toLowerCase() : null
  }

  

  toString(){

  }
}
