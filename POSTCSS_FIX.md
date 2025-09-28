# PostCSS Configuration Fix

## Issue: "PostCSS Plugin was passed as a function using require()"

**Problem:** Next.js requires PostCSS plugins to be provided as strings, not as functions using `require()`.

**Solution:** Use object format with string keys instead of array format with require() calls.

## Correct Configuration:

```js
/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## ❌ Incorrect (causes build error):
```js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
```

## ✅ Correct (works with Next.js):
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

This resolves the "Malformed PostCSS Configuration" error in Netlify builds.