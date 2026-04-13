// 测试 URL 类的基本功能
import { URL } from './cookie-new.js';

// 测试1：基本URL解析
test('解析基本URL https://example.com', () => {
  const url = new URL('https://example.com');

  expect(url.href).toBe('https://example.com');
  expect(url.protocol).toBe('https');
  expect(url.hostname).toBe('example.com');
  expect(url.host).toBe('example.com');
  expect(url.origin).toBe('https://example.com');
  expect(url.pathname).toBe('/');
});

// 测试2：带端口的URL
test('解析带端口的URL https://example.com:8080', () => {
  const url = new URL('https://example.com:8080');

  expect(url.hostname).toBe('example.com');
  expect(url.port).toBe('8080');
  expect(url.host).toBe('example.com:8080');
  expect(url.origin).toBe('https://example.com:8080');
});

// 测试3：带路径的URL
test('解析带路径的URL https://example.com/path/to/page', () => {
  const url = new URL('https://example.com/path/to/page');

  expect(url.pathname).toBe('/path/to/page');
});

// 测试4：带查询参数的URL
test('解析带查询参数的URL https://example.com?a=1&b=2', () => {
  const url = new URL('https://example.com?a=1&b=2');

  expect(url.search).toBe('?a=1&b=2');
});

// 测试5：带fragment的URL
test('解析带fragment的URL https://example.com#section1', () => {
  const url = new URL('https://example.com#section1');

  expect(url.hash).toBe('#section1');
});

// 测试6：完整URL解析
test('解析完整URL https://user:pass@example.com:8080/path?query#frag', () => {
  const url = new URL('https://user:pass@example.com:8080/path?query#frag');

  expect(url.protocol).toBe('https');
  expect(url.username).toBe('user');
  expect(url.password).toBe('pass');
  expect(url.hostname).toBe('example.com');
  expect(url.port).toBe('8080');
  expect(url.host).toBe('example.com:8080');
  expect(url.pathname).toBe('/path');
  expect(url.search).toBe('?query');
  expect(url.hash).toBe('#frag');
  expect(url.origin).toBe('https://example.com:8080');
});