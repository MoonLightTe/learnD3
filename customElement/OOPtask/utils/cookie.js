console.log(document.cookie);

export class Cookie {
  constructor() {}
}

export class URL {
  constructor(url) {
    this.resetValue();
    this.initUrl(url);
  }

  resetValue() {
    this.href = null;
    this.protocol = null;
    this.hash = null;
    this.search = null;
    this.username = null;
    this.password = null;
    this.host = null;
    this.hostname = null;
    this.port = null;
  }

  // 标准url组成 scheme://authority/path?query#fragment
  initUrl(url) {
    this.href = String(url || "");
    const { hash, rest: noHash } = this.splitHash(this.href);
    const { search, rest: noHashQS } = this.splitSeach(noHash);
    const { protocol, rest: afterScheme } = this.splitProtocol(noHashQS);
    console.log("🚀 ~ URL ~ initUrl ~ afterScheme:", afterScheme);
    // authority / pathname
    const { authority, pathname } = this.splitAuthority(afterScheme);

    // userinfo
    const { username, password, hostport } = this.parseUserinfo(authority);

    // host / port
    const { hostname, port } = this.parseHostPort(hostport);

    // host + origin
    const { host, origin } = this.buildOrigin(protocol, hostname, port);
    this.hash = hash;
    this.search = search;
    this.protocol = protocol;
    this.pathname = pathname;
    this.username = username;
    this.password = password;
    this.hostname = hostname;
    this.port = port;
    this.host = host;
    this.origin = origin;
  }
  // 拆分 authority 和 pathname
  splitAuthority(url) {
    if (!url.startsWith("//")) {
      return { authority: "", pathname: s || "/" };
    }
    let s = url.slice(2); // 去掉 //
    const m = s.match(/^([^\/?#]*)/);
    const authority = m ? m[1] : "";
    const pathname = s.slice(authority.length) || "/";

    return { authority, pathname };
  }

  parseUserinfo(authority) {
    const atIdx = authority.lastIndexOf("@");
    if (atIdx === -1) {
      return { username: null, password: null, hostport: authority };
    }

    const userinfo = authority.slice(0, atIdx);
    const hostport = authority.slice(atIdx + 1);
    const [u, p] = userinfo.split(":");
    return {
      username: u ? decodeURIComponent(u) : null,
      password: p ? decodeURIComponent(p) : null,
      hostport,
    };
  }

  parseHostPort(hostport) {
    if (!hostport) {
      return { hostname: null, port: null };
    }
    // ipv6
    if (hostport.startsWith("[")) {
      const idx = hostport.indexOf("]");
      if (idx === -1) {
        return { hostname: hostport, port: null };
      }
      return {
        hostname: hostport.slice(1, idx),
        port: hostport.length > idx + 2 ? hostport.slice(idx + 2) : null,
      };
    }
    // const lastColon = hostport.lastIndexOf(":");
    // if (lastColon > -1 && hostport.indexOf(":") === lastColon) {
    //   return {
    //     hostname: hostport.slice(0, lastColon) || null,
    //     port: hostport.slice(lastColon + 1) || null,
    //   };
    // }
    // 非 IPv6：直接找冒号
    const colonIdx = hostport.lastIndexOf(":");
    if (colonIdx !== -1) {
      const potentialPort = hostport.slice(colonIdx + 1);
      // 验证端口是否合法（纯数字 0-65535）
      if (/^\d+$/.test(potentialPort) && Number(potentialPort) <= 65535) {
        return {
          hostname: hostport.slice(0, colonIdx) || null,
          port: potentialPort,
        };
      }
    }
    return { hostname: hostport, port: null };
  }

  // 4. 组装 host 和 origin（纯计算，不依赖 this）
  buildOrigin(protocol, hostname, port) {
    const host = hostname ? (port ? `${hostname}:${port}` : hostname) : null;

    const origin = protocol && host ? `${protocol}://${host}` : null;

    return { host, origin };
  }

  splitProtocol(url) {
    let protocol = this.getProtocol(url);
    const rest = protocol ? url.slice(protocol.length + 1) : url;
    return {
      protocol,
      rest,
    };
  }

  splitSeach(url) {
    let qIdx = url.indexOf("?");
    let search = qIdx === -1 ? "" : url.slice(qIdx);
    let rest = qIdx === -1 ? url : url.slice(0, qIdx);
    return {
      search,
      rest,
    };
  }

  splitHash(url) {
    let hash = this.getHash(url);
    let idxHash = url.indexOf("#");
    let rest = idxHash === -1 ? url : url.slice(0, idxHash);
    return {
      hash,
      rest,
    };
  }

  // 提取HASH
  getHash(url) {
    if (typeof url !== "string") return null;
    const idx = url.indexOf("#");
    if (idx === -1) return null;
    const fragment = url
      .slice(idx + 1)
      .replace(/[\u0000-\u001F\u007F-\u009F]+/g, "")
      .trim();

    if (!fragment) return null;
    return encodeURIComponent(fragment)
      .replace(/%2F/gi, "/")
      .replace(/%3A/gi, ":")
      .replace(/%3F/gi, "?");
  }
  // 协议
  getProtocol(url) {
    // RFC 3986 规范
    // 首字母必须是字符 后面可以是+ . - 字符 数字 0个或多个
    let regexp = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/;
    let m = url.match(regexp);
    return m ? m[1].toLowerCase() : null;
  }

  toString() {}
}

let ownURL = new URL("https://www.baidu.com:8080?a=1&b=2#ha sh");
console.log("🚀 ~ ownURL:", ownURL);
