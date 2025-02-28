module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "airbnb-typescript/base",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  rules: {
    "spaced-comment": "off",
    "no-restricted-globals": "off"
  }
};