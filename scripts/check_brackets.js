const fs = require('fs')
const s = fs.readFileSync('d:/Users/admin-1/Korker/src/views/menu/FindKorks.vue', 'utf8')
const m = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
if (!m) {
  console.error('no script block')
  process.exit(1)
}
const code = m[1]
const stack = []
const pairs = { '(': ')', '[': ']', '{': '}' }
for (let i = 0; i < code.length; i++) {
  const ch = code[i]
  if (pairs[ch]) {
    stack.push({ ch, i })
  } else if (Object.values(pairs).includes(ch)) {
    const last = stack.pop()
    if (!last) {
      console.error('Unmatched closing', ch, 'at', i)
      process.exit(2)
    }
    if (pairs[last.ch] !== ch) {
      console.error('Mismatched', last.ch, 'at', last.i, 'closed by', ch, 'at', i)
      process.exit(3)
    }
  }
}
if (stack.length) {
  console.error(
    'Unclosed tokens:',
    stack.map((x) => x.ch + '@' + x.i),
  )
  process.exit(4)
}
console.log('All balanced')
