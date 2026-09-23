const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { tsx: 'rompecabezas/Rompecabezas.tsx', css: 'rompecabezas/Rompecabezas.css' },
  { tsx: 'memorama/Memorama.tsx', css: 'memorama/Memorama.css' },
  { tsx: 'reflejos/Reflejos.tsx', css: 'reflejos/Reflejos.css' },
  { tsx: 'secuencia/Secuencia.tsx', css: 'secuencia/Secuencia.css' }
];

games.forEach(game => {
  // Fix TSX inline styles for config-chip
  const tsxPath = path.join(basePath, game.tsx);
  if (fs.existsSync(tsxPath)) {
    let tsxContent = fs.readFileSync(tsxPath, 'utf8');
    tsxContent = tsxContent.replace(/style=\{\{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', order: 99 \}\}/g, "style={{ cursor: 'pointer', order: 99, padding: '0 20px' }}");
    fs.writeFileSync(tsxPath, tsxContent, 'utf8');
  }

  // Fix CSS classes
  const cssPath = path.join(basePath, game.css);
  if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Change metrics-strip align-items
    cssContent = cssContent.replace(/\.metrics-strip\s*\{[\s\S]*?\}/, (match) => {
      return match.replace(/align-items:\s*center;/, 'align-items: stretch;');
    });
    
    // Ensure metric-chip has justify-content: center
    cssContent = cssContent.replace(/\.metric-chip\s*\{[\s\S]*?\}/, (match) => {
      if (!match.includes('justify-content: center')) {
        return match.replace(/align-items:\s*center;/, 'align-items: center;\n  justify-content: center;');
      }
      return match;
    });

    fs.writeFileSync(cssPath, cssContent, 'utf8');
  }
});

console.log("Fixed chip height alignment across all games");
