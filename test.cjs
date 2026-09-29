const fs = require('fs');
let code = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

let tags = [];
let idx = 0;
while (true) {
  let open = code.indexOf('<', idx);
  if (open === -1) break;
  let nextSpace = code.indexOf(' ', open);
  let nextClose = code.indexOf('>', open);
  let end = Math.min(nextSpace !== -1 ? nextSpace : 99999, nextClose !== -1 ? nextClose : 99999);
  let tag = code.substring(open + 1, end);
  if (tag.startsWith('/') || tag.match(/^[a-zA-Z]/)) {
     // skip self closing if possible, but regex is easier.
  }
  idx = open + 1;
}
