// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"utils/cookie.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.URL = exports.Cookie = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
console.log(document.cookie);
var Cookie = exports.Cookie = /*#__PURE__*/_createClass(function Cookie() {
  _classCallCheck(this, Cookie);
});
var URL = exports.URL = /*#__PURE__*/function () {
  function URL(url) {
    _classCallCheck(this, URL);
    this.resetValue();
    this.initUrl(url);
  }
  return _createClass(URL, [{
    key: "resetValue",
    value: function resetValue() {
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
  }, {
    key: "initUrl",
    value: function initUrl(url) {
      this.href = String(url || "");
      var _this$splitHash = this.splitHash(this.href),
        hash = _this$splitHash.hash,
        noHash = _this$splitHash.rest;
      var _this$splitSeach = this.splitSeach(noHash),
        search = _this$splitSeach.search,
        noHashQS = _this$splitSeach.rest;
      var _this$splitProtocol = this.splitProtocol(noHashQS),
        protocol = _this$splitProtocol.protocol,
        afterScheme = _this$splitProtocol.rest;
      console.log("🚀 ~ URL ~ initUrl ~ afterScheme:", afterScheme);
      // authority / pathname
      var _this$splitAuthority = this.splitAuthority(afterScheme),
        authority = _this$splitAuthority.authority,
        pathname = _this$splitAuthority.pathname;

      // userinfo
      var _this$parseUserinfo = this.parseUserinfo(authority),
        username = _this$parseUserinfo.username,
        password = _this$parseUserinfo.password,
        hostport = _this$parseUserinfo.hostport;

      // host / port
      var _this$parseHostPort = this.parseHostPort(hostport),
        hostname = _this$parseHostPort.hostname,
        port = _this$parseHostPort.port;

      // host + origin
      var _this$buildOrigin = this.buildOrigin(protocol, hostname, port),
        host = _this$buildOrigin.host,
        origin = _this$buildOrigin.origin;
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
  }, {
    key: "splitAuthority",
    value: function splitAuthority(url) {
      if (!url.startsWith("//")) {
        return {
          authority: "",
          pathname: s || "/"
        };
      }
      var s = url.slice(2); // 去掉 //
      var m = s.match(/^([^\/?#]*)/);
      var authority = m ? m[1] : "";
      var pathname = s.slice(authority.length) || "/";
      return {
        authority: authority,
        pathname: pathname
      };
    }
  }, {
    key: "parseUserinfo",
    value: function parseUserinfo(authority) {
      var atIdx = authority.lastIndexOf("@");
      if (atIdx === -1) {
        return {
          username: null,
          password: null,
          hostport: authority
        };
      }
      var userinfo = authority.slice(0, atIdx);
      var hostport = authority.slice(atIdx + 1);
      var _userinfo$split = userinfo.split(":"),
        _userinfo$split2 = _slicedToArray(_userinfo$split, 2),
        u = _userinfo$split2[0],
        p = _userinfo$split2[1];
      return {
        username: u ? decodeURIComponent(u) : null,
        password: p ? decodeURIComponent(p) : null,
        hostport: hostport
      };
    }
  }, {
    key: "parseHostPort",
    value: function parseHostPort(hostport) {
      if (!hostport) {
        return {
          hostname: null,
          port: null
        };
      }
      // ipv6
      if (hostport.startsWith("[")) {
        var idx = hostport.indexOf("]");
        if (idx === -1) {
          return {
            hostname: hostport,
            port: null
          };
        }
        return {
          hostname: hostport.slice(1, idx),
          port: hostport.length > idx + 2 ? hostport.slice(idx + 2) : null
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
      var colonIdx = hostport.lastIndexOf(":");
      if (colonIdx !== -1) {
        var potentialPort = hostport.slice(colonIdx + 1);
        // 验证端口是否合法（纯数字 0-65535）
        if (/^\d+$/.test(potentialPort) && Number(potentialPort) <= 65535) {
          return {
            hostname: hostport.slice(0, colonIdx) || null,
            port: potentialPort
          };
        }
      }
      return {
        hostname: hostport,
        port: null
      };
    }

    // 4. 组装 host 和 origin（纯计算，不依赖 this）
  }, {
    key: "buildOrigin",
    value: function buildOrigin(protocol, hostname, port) {
      var host = hostname ? port ? "".concat(hostname, ":").concat(port) : hostname : null;
      var origin = protocol && host ? "".concat(protocol, "://").concat(host) : null;
      return {
        host: host,
        origin: origin
      };
    }
  }, {
    key: "splitProtocol",
    value: function splitProtocol(url) {
      var protocol = this.getProtocol(url);
      var rest = protocol ? url.slice(protocol.length + 1) : url;
      return {
        protocol: protocol,
        rest: rest
      };
    }
  }, {
    key: "splitSeach",
    value: function splitSeach(url) {
      var qIdx = url.indexOf("?");
      var search = qIdx === -1 ? "" : url.slice(qIdx);
      var rest = qIdx === -1 ? url : url.slice(0, qIdx);
      return {
        search: search,
        rest: rest
      };
    }
  }, {
    key: "splitHash",
    value: function splitHash(url) {
      var hash = this.getHash(url);
      var idxHash = url.indexOf("#");
      var rest = idxHash === -1 ? url : url.slice(0, idxHash);
      return {
        hash: hash,
        rest: rest
      };
    }

    // 提取HASH
  }, {
    key: "getHash",
    value: function getHash(url) {
      if (typeof url !== "string") return null;
      var idx = url.indexOf("#");
      if (idx === -1) return null;
      var fragment = url.slice(idx + 1).replace(/[\u0000-\u001F\u007F-\u009F]+/g, "").trim();
      if (!fragment) return null;
      return encodeURIComponent(fragment).replace(/%2F/gi, "/").replace(/%3A/gi, ":").replace(/%3F/gi, "?");
    }
    // 协议
  }, {
    key: "getProtocol",
    value: function getProtocol(url) {
      // RFC 3986 规范
      // 首字母必须是字符 后面可以是+ . - 字符 数字 0个或多个
      var regexp = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/;
      var m = url.match(regexp);
      return m ? m[1].toLowerCase() : null;
    }
  }, {
    key: "toString",
    value: function toString() {}
  }]);
}();
var ownURL = new URL("https://www.baidu.com:8080?a=1&b=2#ha sh");
console.log("🚀 ~ ownURL:", ownURL);
},{}],"../../../../.nvm/versions/node/v22.14.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "64294" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["../../../../.nvm/versions/node/v22.14.0/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","utils/cookie.js"], null)
//# sourceMappingURL=/cookie.7c69df7b.js.map