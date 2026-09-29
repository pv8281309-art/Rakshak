const fs = require('fs');

let content = fs.readFileSync('src/pages/admin/LiveMonitoring.tsx', 'utf8');
content = content.replace("html: `<div style=\"background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8); animation: pulse 2s infinite;\"></div>`,", "html: `<div class=\"animate-ping\" style=\"background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);\"></div>`,");
fs.writeFileSync('src/pages/admin/LiveMonitoring.tsx', content);

content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');
content = content.replace("html: '<div style=\"background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8); animation: pulse 1s infinite;\"></div>',", "html: '<div class=\"animate-ping\" style=\"background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);\"></div>',");
fs.writeFileSync('src/pages/user/UserDashboard.tsx', content);
