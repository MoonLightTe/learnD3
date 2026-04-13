// 最终测试运行器 - 包含所有TDD测试
const testResults = [];

// 模拟测试函数
function test(name, fn) {
  try {
    fn();
    testResults.push({ name, status: 'PASS' });
    console.log('✅', name);
  } catch (error) {
    testResults.push({ name, status: 'FAIL', error: error.message });
    console.log('❌', name);
    console.log('   Error:', error.message);
  }
}

// 导入实现
const { URL, Cookie } = require('./cookie-new.js');

console.log('='.repeat(50));
console.log('🚀 TDD 完整测试流程演示');
console.log('='.repeat(50));

// ===== URL 类测试 =====
console.log('\n📡 URL 类测试：');

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

// 测试4：带用户名密码的URL
test('解析带用户名密码的URL https://user:pass@example.com', () => {
  const url = new URL('https://user:pass@example.com');
  expect(url.username).toBe('user');
  expect(url.password).toBe('pass');
  expect(url.hostname).toBe('example.com');
  expect(url.origin).toBe('https://example.com');
});

// ===== Cookie 类测试 =====
console.log('\n🍪 Cookie 类测试：');

// 测试1：创建和获取Cookie
test('Cookie基本操作', () => {
  const cookie = new Cookie();

  cookie.set('name', 'value');
  expect(cookie.get('name')).toBe('value');

  cookie.set('user', 'john', { path: '/home' });
  expect(cookie.get('user')).toBe('john');
});

// 测试2：Cookie过期功能
test('Cookie过期功能', () => {
  const cookie = new Cookie();

  // 设置1分钟后过期的Cookie
  const future = new Date(Date.now() + 60000);
  cookie.set('temp', 'value', { expires: future });
  expect(cookie.get('temp')).toBe('value');

  // 设置过去的时间
  const past = new Date(Date.now() - 1000);
  cookie.set('expired', 'value', { expires: past });
  expect(cookie.get('expired')).toBe(null);
});

// 测试3：删除Cookie
test('删除Cookie', () => {
  const cookie = new Cookie();

  cookie.set('removable', 'value');
  expect(cookie.remove('removable')).toBe(true);
  expect(cookie.get('removable')).toBe(null);
});

// ===== 性能和边界测试 =====
console.log('\n🔧 边界测试：');

// 测试1：空值处理
test('空值处理', () => {
  const url = new URL('');
  expect(url.href).toBe('');

  const cookie = new Cookie();
  expect(cookie.get('nonexistent')).toBe(null);
});

// 测试2：特殊字符
test('特殊字符处理', () => {
  const url = new URL('https://user%20name:pass%20word@example.com/path%20with%20spaces');
  expect(url.username).toBe('user name');
  expect(url.password).toBe('pass word');
  expect(url.pathname).toBe('/path with spaces');
});

console.log('\n' + '='.repeat(50));
console.log('📊 最终测试结果汇总');
console.log('='.repeat(50));

const passed = testResults.filter(t => t.status === 'PASS').length;
const failed = testResults.filter(t => t.status === 'FAIL').length;

console.log(`\n总测试数: ${passed + failed}`);
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 所有测试通过！TDD流程演示成功！');
} else {
  console.log('\n⚠️  有测试失败，需要继续完善实现。');
}

console.log('\n📝 TDD 流程总结:');
console.log('1. ✅ RED - 编写失败的测试');
console.log('2. ✅ GREEN - 实现最少代码让测试通过');
console.log('3. ✅ REFACTOR - 优化代码，保持测试通过');
console.log('4. ✅ 重复 - 添加更多测试，完善功能');

// 辅助函数
function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`期望值 ${expected}，实际值 ${actual}`);
      }
    }
  };
}