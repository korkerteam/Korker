const fs = require('fs')
const p = 'd:/Users/admin-1/Korker/src/views/menu/FindKorks.vue'
const s = fs.readFileSync(p, 'utf8').split('\n')
for (let i = 0; i < s.length && i < 400; i++) {
  console.log((i + 1).toString().padStart(3, ' ') + ': ' + s[i])
}
