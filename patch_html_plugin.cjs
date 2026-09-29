const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

if (!content.includes('transformIndexHtml')) {
    content = content.replace(
        "plugins: [react(), tailwindcss()],",
        `plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /%VITE_GOOGLE_MAPS_API_KEY%/g,
            env.VITE_GOOGLE_MAPS_API_KEY
          );
        }
      }
    ],`
    );
    fs.writeFileSync('vite.config.ts', content);
}
