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
const { URL } = require('./cookie-new.js');

// 测试：带用户名密码的URL
test('解析带用户名密码的URL https://user:pass@example.com', () => {
  const url = new URL('https://user:pass@example.com');

  if (url.username !== 'user') throw new Error('username不正确');
  if (url.password !== 'pass') throw new Error('password不正确');
  if (url.hostname !== 'example.com') throw new Error('hostname不正确');
  if (url.host !== 'example.com') throw new Error('host不正确');
  if (url.origin !== 'https://example.com') throw new Error('origin不正确');
});

console.log('\n📊 认证测试结果:');
console.log(`通过: ${testResults.filter(t => t.status === 'PASS').length}`);
console.log(`失败: ${testResults.filter(t => t.status === 'FAIL').length}`);

if (testResults.some(t => t.status === 'FAIL')) {
  console.log('\n🔴 认证测试失败 - 需要实现认证功能！');
} else {
  console.log('\n🟢 认证测试通过！');
}