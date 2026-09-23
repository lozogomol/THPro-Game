const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { tsx: 'rompecabezas/Rompecabezas.tsx', css: 'rompecabezas/Rompecabezas.css', wrapper: '.rompecabezas-wrapper' },
  { tsx: 'memorama/Memorama.tsx', css: 'memorama/Memorama.css', wrapper: '.memorama-wrapper' },
  { tsx: 'reflejos/Reflejos.tsx', css: 'reflejos/Reflejos.css', wrapper: '.reflejos-wrapper' },
  { tsx: 'secuencia/Secuencia.tsx', css: 'secuencia/Secuencia.css', wrapper: '.secuencia-wrapper' }
];

games.forEach(game => {
  // Fix TSX config layout and difficulty pill group
  const tsxPath = path.join(basePath, game.tsx);
  if (fs.existsSync(tsxPath)) {
    let content = fs.readFileSync(tsxPath, 'utf8');
    
    // 1. Revert grid to flex column for difficulty-pill-group
    content = content.replace(/className="difficulty-pill-group" style=\{\{\s*display:\s*'grid',\s*gridTemplateColumns:\s*'repeat\(auto-fit, minmax\(120px, 1fr\)\)',\s*gap:\s*'12px'\s*\}\}/g, 
                              `className="difficulty-pill-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}`);
    
    // Also make sure buttons inside take full width if needed (btn-primary-action already stretches in flex column if align-items isn't center, or we can just let flex defaults work).
    
    // 2. Expand config-box width. Remove strict maxWidth limits if they exist
    content = content.replace(/style=\{\{\s*width:\s*'100%',\s*maxWidth:\s*'350px'/g, "style={{ width: '100%', maxWidth: '100%'");
    
    fs.writeFileSync(tsxPath, content, 'utf8');
  }

  // Fix CSS wrapper padding to 5mm
  const cssPath = path.join(basePath, game.css);
  if (fs.existsSync(cssPath)) {
    let content = fs.readFileSync(cssPath, 'utf8');
    const wrapperRegex = new RegExp(`\\${game.wrapper}\\s*\\{[\\s\\S]*?\\}`);
    content = content.replace(wrapperRegex, (match) => {
      return match.replace(/padding:\s*10mm;/, 'padding: 5mm;');
    });
    
    // Memorama specific: .config-box max-width
    if (game.css.includes('Memorama')) {
      content = content.replace(/\.config-box\s*\{[\s\S]*?max-width:\s*480px;/, (match) => {
        return match.replace(/max-width:\s*480px;/, 'max-width: 100%;');
      });
    }
    
    fs.writeFileSync(cssPath, content, 'utf8');
  }
});

console.log("Fixed margins to 5mm and difficulty to vertical list");
