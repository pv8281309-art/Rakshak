const fs = require('fs');
const filePath = 'src/pages/user/UserLogin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetForm = `          <form onSubmit={handleLogin} className="space-y-6">`;

const fixedForm = `          <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center mb-4">
              <p className="text-xs text-blue-400 font-medium tracking-wide">
                Demo Credentials: <span className="text-white font-bold">demo</span> / <span className="text-white font-bold">demo</span>
              </p>
            </div>`;

content = content.replace(targetForm, fixedForm);

fs.writeFileSync(filePath, content);
console.log("Patched UserLogin with Demo Hint");
