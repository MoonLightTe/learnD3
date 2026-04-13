export class URL {
  constructor(url) {
    this.href = String(url || "");
    this.initUrl(this.href);
  }

  initUrl(url) {
    // 保存原始URL
    this.href = url;

    // 解析认证信息
    const atIdx = url.indexOf('@');
    let restUrl = url;
    if (atIdx > 0) {
      const authPart = url.substring(0, atIdx);
      if (authPart.startsWith('https://') || authPart.startsWith('http://')) {
        // 情况1: https://user:pass@host
        const protocolEnd = authPart.indexOf('://');
        const protocol = authPart.substring(0, protocolEnd);
        this.protocol = protocol;

        const authInfo = authPart.substring(protocolEnd + 3, atIdx);
        const [username, password] = authInfo.split(':');
        this.username = decodeURIComponent(username);
        this.password = password ? decodeURIComponent(password) : null;

        restUrl = url.substring(atIdx + 1);
      }
    } else {
      this.protocol = null;
      this.username = null;
      this.password = null;
    }

    // 从剩余URL中解析协议
    if (!this.protocol && restUrl.startsWith('https://')) {
      this.protocol = 'https';
      restUrl = restUrl.slice(8);
    } else if (!this.protocol && restUrl.startsWith('http://')) {
      this.protocol = 'http';
      restUrl = restUrl.slice(7);
    }

    // 分割主机和路径
    const firstSlash = restUrl.indexOf('/');
    const domainPart = firstSlash === -1 ? restUrl : restUrl.slice(0, firstSlash);
    const pathPart = firstSlash === -1 ? '/' : '/' + restUrl.slice(firstSlash + 1);

    // 处理端口
    if (domainPart.includes(':')) {
      const [host, port] = domainPart.split(':');
      this.hostname = host;
      this.port = port;
      this.host = `${host}:${port}`;
    } else {
      this.hostname = domainPart;
      this.host = domainPart;
    }

    // 设置其他属性
    this.pathname = decodeURIComponent(pathPart);
    this.origin = this.protocol && this.host ? `${this.protocol}://${this.host}` : null;
  }

  toString() {
    return this.href;
  }
}

export class Cookie {
  constructor() {
    this.cookies = {};
  }

  // 获取Cookie
  get(name) {
    const cookie = this.cookies[name];
    if (!cookie) return null;

    // 检查是否过期
    if (cookie.expires && new Date() > new Date(cookie.expires)) {
      delete this.cookies[name];
      return null;
    }

    return cookie.value;
  }

  // 设置Cookie
  set(name, value, options = {}) {
    const cookie = {
      value,
      expires: options.expires ? new Date(options.expires).toUTCString() : null,
      path: options.path || '/',
      domain: options.domain || null,
      secure: options.secure || false,
      httponly: options.httponly || false
    };

    this.cookies[name] = cookie;
    return true;
  }

  // 删除Cookie
  remove(name, options = {}) {
    if (this.get(name)) {
      // 设置过期时间为过去
      this.set(name, '', {
        expires: new Date(0),
        path: options.path || '/',
        domain: options.domain || null
      });
      delete this.cookies[name];
      return true;
    }
    return false;
  }

  // 获取所有Cookie
  getAll() {
    const result = {};
    for (const [name, cookie] of Object.entries(this.cookies)) {
      if (!cookie.expires || new Date() < new Date(cookie.expires)) {
        result[name] = cookie.value;
      }
    }
    return result;
  }
}