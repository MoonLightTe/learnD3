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

// 测试1：基本URL解析
test('解析基本URL https://example.com', () => {
  const { URL } = require('./cookie-new.js');
  const url = new URL('https://example.com');

  if (url.href !== 'https://example.com') throw new Error('href不正确');
  if (url.protocol !== 'https') throw new Error('protocol不正确');
  if (url.hostname !== 'example.com') throw new Error('hostname不正确');
  if (url.host !== 'example.com') throw new Error('host不正确');
  if (url.origin !== 'https://example.com') throw new Error('origin不正确');
  if (url.pathname !== '/') throw new Error('pathname不正确');
});

// 测试2：带端口的URL
test('解析带端口的URL https://example.com:8080', () => {
  const { URL } = require('./cookie-new.js');
  const url = new URL('https://example.com:8080');

  if (url.hostname !== 'example.com') throw new Error('hostname不正确');
  if (url.port !== '8080') throw new Error('port不正确');
  if (url.host !== 'example.com:8080') throw new Error('host不正确');
  if (url.origin !== 'https://example.com:8080') throw new Error('origin不正确');
});

// 测试3：带路径的URL
test('解析带路径的URL https://example.com/path/to/page', () => {
  const { URL } = require('./cookie-new.js');
  const url = new URL('https://example.com/path/to/page');

  if (url.pathname !== '/path/to/page') throw new Error('pathname不正确');
});

console.log('\n📊 测试结果:');
console.log(`通过: ${testResults.filter(t => t.status === 'PASS').length}`);
console.log(`失败: ${testResults.filter(t => t.status === 'FAIL').length}`);

if (testResults.some(t => t.status === 'FAIL')) {
  console.log('\n🔴 测试失败 - 这是预期的TDD RED阶段！');
} else {
  console.log('\n🟢 所有测试通过！');
}