/**
 * PostCSS 配置（CommonJS 版本，兼容更多环境）
 * CommonJS format to avoid ESM interop issues on some setups.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}

