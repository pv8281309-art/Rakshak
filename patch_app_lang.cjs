const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('LanguageProvider')) {
  content = content.replace("import { ThemeProvider } from './contexts/ThemeContext';", "import { ThemeProvider } from './contexts/ThemeContext';\nimport { LanguageProvider } from './contexts/LanguageContext';");
  content = content.replace("<ThemeProvider>", "<ThemeProvider>\n        <LanguageProvider>");
  content = content.replace("</ThemeProvider>", "        </LanguageProvider>\n      </ThemeProvider>");
  fs.writeFileSync('src/App.tsx', content);
}
