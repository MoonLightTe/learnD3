module.exports = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
        parserOpts: {
            headerPattern: /^(.*?)(?:\()(.*?)(?:\)):\s?(.*)$/,
            headerCorrespondence: ['type', 'scope', 'subject'],
        },
    },
    rules: {
        'type-empty': [2, 'never'],
        'subject-empty': [2, 'never'],
    },
};
