const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const cssFiles = [
  'rompecabezas/Rompecabezas.css',
  'reflejos/Reflejos.css',
  'secuencia/Secuencia.css',
  'memorama/Memorama.css'
];

cssFiles.forEach(file => {
  const p = path.join(basePath, file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Replace max-width: 480px or max-width: 400px with max-width: 100% for config-box
    content = content.replace(/\.config-box\s*\{[\s\S]*?\}/, match => {
      return match.replace(/max-width:\s*\d+px;/, 'max-width: 100%;');
    });
    
    fs.writeFileSync(p, content, 'utf8');
  }
});

console.log("Made config boxes expand to 100% in all CSS files");
