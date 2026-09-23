const fs = require('fs');
const path = require('path');

// 1. Rename the title in Rompecabezas
const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let rompContent = fs.readFileSync(rompPath, 'utf8');
rompContent = rompContent.replace(/Selecci.n de Imagen/g, 'Selecci\xF3n de Rompecabezas');
fs.writeFileSync(rompPath, rompContent, 'utf8');

// 2. Add min-height to all config-box classes in all CSS
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
    
    // Check if min-height is already there
    if (!content.includes('min-height: 360px')) {
      content = content.replace(/\.config-box\s*\{/, match => {
        return match + '\n  min-height: 380px;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: stretch;';
      });
      fs.writeFileSync(p, content, 'utf8');
    }
  }
});

console.log("Updated title and standardized config box size");
