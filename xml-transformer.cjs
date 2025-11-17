const fs = require('node:fs')

module.exports = {
  process(src, filename) {
    const content = fs.readFileSync(filename, 'utf-8')
    return {
      code: `module.exports = ${JSON.stringify(content)};`,
    }
  },
}
