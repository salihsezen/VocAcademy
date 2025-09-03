const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m, i=0, errors=[];
while ((m = scriptRegex.exec(html))) {
  i++;
  const code = m[1];
  try { new Function(code); }
  catch (e) { errors.push({ index: i, message: e.message, stack: e.stack, snippet: code.slice(Math.max(0, e.pos-100)||0, (e.pos||0)+100) }); }
}
if (errors.length === 0) {
  console.log('OK: no syntax errors');
} else {
  console.log('Syntax errors:', errors.length);
  for (const err of errors) {
    console.log('\n# Script', err.index);
    console.log(err.message);
    if (err.stack) console.log(err.stack.split('\n')[0]);
  }
}
