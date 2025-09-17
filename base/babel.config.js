module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                browsers: 'last 2 versions' // 或者根据你的需求设置目标环境
            }
        }]
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-property-in-object'
    ]
};