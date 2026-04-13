// 使用 Jest 测试框架的版本
const { URL, Cookie } = require('./cookie-new.js');

describe('URL 类', () => {
  describe('基本解析', () => {
    test('解析基本URL https://example.com', () => {
      const url = new URL('https://example.com');

      expect(url.href).toBe('https://example.com');
      expect(url.protocol).toBe('https');
      expect(url.hostname).toBe('example.com');
      expect(url.host).toBe('example.com');
      expect(url.origin).toBe('https://example.com');
      expect(url.pathname).toBe('/');
    });

    test('解析带端口的URL https://example.com:8080', () => {
      const url = new URL('https://example.com:8080');

      expect(url.hostname).toBe('example.com');
      expect(url.port).toBe('8080');
      expect(url.host).toBe('example.com:8080');
      expect(url.origin).toBe('https://example.com:8080');
    });

    test('解析带路径的URL https://example.com/path/to/page', () => {
      const url = new URL('https://example.com/path/to/page');

      expect(url.pathname).toBe('/path/to/page');
    });
  });

  describe('认证信息', () => {
    test('解析带用户名密码的URL https://user:pass@example.com', () => {
      const url = new URL('https://user:pass@example.com');

      expect(url.username).toBe('user');
      expect(url.password).toBe('pass');
      expect(url.hostname).toBe('example.com');
      expect(url.origin).toBe('https://example.com');
    });

    test('解析带特殊字符的用户名密码', () => {
      const url = new URL('https://user%20name:pass%20word@example.com');

      expect(url.username).toBe('user name');
      expect(url.password).toBe('pass word');
    });
  });

  describe('边界情况', () => {
    test('处理空URL', () => {
      const url = new URL('');
      expect(url.href).toBe('');
    });

    test('处理带空格的路径', () => {
      const url = new URL('https://example.com/path%20with%20spaces');
      expect(url.pathname).toBe('/path with spaces');
    });
  });
});

describe('Cookie 类', () => {
  let cookie;

  beforeEach(() => {
    cookie = new Cookie();
  });

  describe('基本操作', () => {
    test('设置和获取Cookie', () => {
      cookie.set('name', 'value');
      expect(cookie.get('name')).toBe('value');

      cookie.set('user', 'john', { path: '/home' });
      expect(cookie.get('user')).toBe('john');
    });

    test('获取不存在的Cookie返回null', () => {
      expect(cookie.get('nonexistent')).toBeNull();
    });
  });

  describe('过期功能', () => {
    test('设置未来时间的Cookie', () => {
      const future = new Date(Date.now() + 60000);
      cookie.set('temp', 'value', { expires: future });

      expect(cookie.get('temp')).toBe('value');
    });

    test('过期Cookie自动删除', () => {
      const past = new Date(Date.now() - 1000);
      cookie.set('expired', 'value', { expires: past });

      expect(cookie.get('expired')).toBeNull();
    });

    test('getAll不包含过期的Cookie', () => {
      const future = new Date(Date.now() + 60000);
      const past = new Date(Date.now() - 1000);

      cookie.set('valid', 'value1', { expires: future });
      cookie.set('expired', 'value2', { expires: past });

      const all = cookie.getAll();
      expect(all).toHaveProperty('valid');
      expect(all).not.toHaveProperty('expired');
    });
  });

  describe('删除功能', () => {
    test('删除存在的Cookie', () => {
      cookie.set('removable', 'value');
      const result = cookie.remove('removable');

      expect(result).toBe(true);
      expect(cookie.get('removable')).toBeNull();
    });

    test('删除不存在的Cookie返回false', () => {
      const result = cookie.remove('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('复杂选项', () => {
    test('设置Cookie的各种选项', () => {
      const options = {
        path: '/api',
        domain: 'example.com',
        secure: true,
        httponly: true
      };

      cookie.set('secure', 'value', options);
      const cookieObj = cookie.cookies['secure'];

      expect(cookieObj.path).toBe('/api');
      expect(cookieObj.domain).toBe('example.com');
      expect(cookieObj.secure).toBe(true);
      expect(cookieObj.httponly).toBe(true);
    });
  });

  describe('批量操作', () => {
    test('获取所有有效的Cookie', () => {
      cookie.set('name1', 'value1');
      cookie.set('name2', 'value2');
      cookie.set('name3', 'value3');

      const all = cookie.getAll();

      expect(all).toEqual({
        name1: 'value1',
        name2: 'value2',
        name3: 'value3'
      });
    });

    test('删除Cookie后getAll不包含它', () => {
      cookie.set('name1', 'value1');
      cookie.set('name2', 'value2');
      cookie.remove('name1');

      const all = cookie.getAll();
      expect(all).toEqual({ name2: 'value2' });
    });
  });
});