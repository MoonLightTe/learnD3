import axios from "axios";

const instance = axios.create();
const CancelToken = axios.CancelToken;

instance.interceptors.request.use(function (config) {
  let url = config.url;
  let params = config.params || {};

  url = url.replace(/\{(\w+)\}/g, function (match, key) {
    // 仅当 params 明确包含该键（允许 0/false/'' 等值）时替换
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      // 可根据需求决定是否删除 params[key]
      delete params[key];
      return encodeURIComponent(value == null ? "" : String(value));
    }
    // 未找到时保留原占位符或返回空串，根据需求选其一
    return match; // 保留，占位符未被替换
  });

  config.url = url;
  config.params = params; // 更新 params（可能已删除部分键）
  return config;
});

instance.interceptors.request.use(function (config) {
  if (!config || typeof config.url !== 'string') return config;

  // 只匹配以 METHOD 开头的模式，例如: "GET /path" 或 "  POST   /path?x=1"
  const match = config.url.trim().match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(.+)$/i);
  if (match) {
    const [, method, urlPart] = match;
    // 仅在调用方没有显式指定 method 时才覆盖，避免无意覆盖
    if (!config.method) {
      config.method = method.toLowerCase();
    }
    config.url = urlPart;
  }

  return config;
});


instance.interceptors.request.use(function (config) {
  if(config.getCancelMethod && typeof config.getCancelMethod === 'function'){
      config.cancelToken = new CancelToken(function executor(c) {
          config.getCancelMethod(c);
      })

      delete config.getCancelMethod;
  }
  return config;
});


instance.interceptors.request.use(function (config) {
  if (!config || typeof config.url !== 'string') return config;

  // 幂等保护，防止重复处理
  if (config.__requestProcessed) return config;

  // 1. 解析 METHOD 前缀（若存在）
  const trimmed = config.url.trim();
  const m = trimmed.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+(.+)$/i);
  if (m) {
    if (!config.method) config.method = m[1].toLowerCase();
    config.url = m[2];
  }

  // 2. 用 params 替换 path 占位符并从 params 中移除已替换键
  const params = config.params || {};
  // 支持连字符等更宽松的 key：{some-key}
  config.url = config.url.replace(/\{\s*([^\}]+)\s*\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];
      // 不直接修改传入 params，创建浅拷贝并替换回去
      config.params = { ...params };
      delete config.params[key];
      return encodeURIComponent(value == null ? "" : String(value));
    }
    return match; // 保留未替换占位符
  });

  // 3. 支持取消请求回调（优先使用 AbortController，如果环境/axios 支持）
  if (config.getCancelMethod && typeof config.getCancelMethod === 'function') {
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      config.signal = controller.signal;
      config.getCancelMethod(controller.abort.bind(controller));
    } else if (axios.CancelToken) {
      config.cancelToken = new axios.CancelToken(function (c) {
        config.getCancelMethod(c);
      });
    }
    // 不再需要该字段
    delete config.getCancelMethod;
  }

  config.__requestProcessed = true;
  return config;
});