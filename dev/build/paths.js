const path = require('path');

// 获取项目根目录的绝对路径
const rootDir = path.resolve(__dirname, '../../');

/**
 * 解析项目中的路径
 * @param  {...string} relativePath 相对于项目根目录的路径片段
 * @returns {string} 解析后的绝对路径
 */
const resolvePath = (...relativePath) => {
  return path.resolve(rootDir, ...relativePath);
};

// 导出常用路径配置
module.exports = {
  root: rootDir,
  src: resolvePath('src'),
  domain: resolvePath('domain'),
  dev: resolvePath('dev'),
  resolve: resolvePath,
};