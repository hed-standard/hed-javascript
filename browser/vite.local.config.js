// browser/vite.local.config.js
import baseConfig from './vite.config.js'

export default {
  ...baseConfig,
  base: './'  // Override just the base for local preview
}
