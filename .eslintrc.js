const path = require("path")
const Paths = require("./configs/paths")

module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "airbnb-base",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "plugins": [
    "react-hooks",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "impliedStrict": true,
      "jsx": true
    }
  },
  rules: {
    // windows风格的换行(而非unix)
    "linebreak-style": ["error", "windows"],
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "semi": ["error", "never"],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // eslint已经有了 global-require
    "@typescript-eslint/no-var-requires": "off",
    // 便于调试, 所以允许console
    "no-console": "off",
    // scss自动生成的scss.d.ts没有使用default, 同时一些utils可能从语义上来说没有default导出, 所以关闭
    "import/prefer-default-export": "off",
    "no-prototype-builtins": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "max-len": "off",
    "no-underscore-dangle": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "import/no-extraneous-dependencies": "off",
    "@typescript-eslint/ban-ts-ignore": "off",
  },
  "settings": {
    "import/resolver": {
      "webpack": {
        "config": "./configs/webpack.base.config.js",
      },
    },
    // "import/extensions": [".ts", ".tsx", ".js", ".jsx", ".json"],
    "react": {
      "version": "detect",
    }
  },
}
