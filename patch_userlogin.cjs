const fs = require('fs');
const filePath = 'src/pages/user/UserLogin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `      const success = await signIn(userId.trim(), password.trim(), 'user');
      if (success) {
        navigate('/user/dashboard', { replace: true });
      } else {
        setError('Invalid credentials or account disabled. Please contact administrator.');
      }`;

const fixed = `      const result = await signIn(userId.trim(), password.trim(), 'user');
      if (result.success) {
        if (result.requiresPasswordChange) {
           navigate('/user/change-password', { replace: true });
        } else {
           navigate('/user/dashboard', { replace: true });
        }
      } else {
        setError('Invalid credentials or account disabled. Please contact administrator.');
      }`;

content = content.replace(target, fixed);
fs.writeFileSync(filePath, content);
console.log("Patched UserLogin");
