# PostCSS Configuration Fix

This directory contains multiple PostCSS configurations to handle different deployment scenarios:

- `postcss.config.js` - Main configuration (CommonJS format)
- `postcss.config.mjs` - ESM format (backup)
- `postcss.config.backup.js` - Simplified fallback

Using array format for better compatibility:
```js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}
```

This resolves the "missing plugins key" error.