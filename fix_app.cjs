const fs = require('fs');
let appPath = 'src/App.tsx';
let app = fs.readFileSync(appPath, 'utf8');

app = app.replace(/<Route path="\/" element=\{<LandingPage \/>\} \/>[\s\S]*?<\/Route>/, '<Route path="/" element={<LandingPage />} />');

fs.writeFileSync(appPath, app);
console.log("Fixed App.tsx");
