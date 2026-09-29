const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

if (!content.includes('loadEnv')) {
    content = content.replace(
        "import {defineConfig} from 'vite';",
        "import {defineConfig, loadEnv} from 'vite';"
    );
    
    content = content.replace(
        "export default defineConfig(() => {",
        "export default defineConfig(({ mode }) => {\n  const env = loadEnv(mode, process.cwd(), '');"
    );
    
    content = content.replace(
        "return {",
        `return {
    define: {
      'process.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY)
    },`
    );
    
    fs.writeFileSync('vite.config.ts', content);
}
