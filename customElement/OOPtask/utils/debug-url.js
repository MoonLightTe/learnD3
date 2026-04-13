const { URL } = require('./cookie-new.js');

const url = new URL('https://user:pass@example.com');
console.log('解析结果:');
console.log('href:', url.href);
console.log('protocol:', url.protocol);
console.log('username:', url.username);
console.log('password:', url.password);
console.log('hostname:', url.hostname);
console.log('host:', url.host);
console.log('origin:', url.origin);
console.log('pathname:', url.pathname);