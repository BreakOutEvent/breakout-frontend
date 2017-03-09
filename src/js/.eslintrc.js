module.exports = {
    "env": {
        "es6": true,
        "browser": true,
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "rules": {
        "indent": [
            "error",
            2, {
                "SwitchCase": 1
            }
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        'no-console': 0,
        'no-unused-vars': 1,
    },
    'globals': {
        'google': true,
        'io': true,
        'infowindow': true
    },
    'plugins': ['react'],
    'parserOptions': {
      'sourceType': "module",
      'ecmaFeatures': {
        'jsx': true
      }
    }
};