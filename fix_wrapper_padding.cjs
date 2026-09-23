const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { css: 'rompecabezas/Rompecabezas.css', wrapper: '.rompecabezas-wrapper' },
  { css: 'memorama/Memorama.css', wrapper: '.memorama-wrapper' },
  { css: 'reflejos/Reflejos.css', wrapper: '.reflejos-wrapper' },
  { css: 'secuencia/Secuencia.css', wrapper: '.secuencia-wrapper' }
];

games.forEach(game => {
  const p = path.join(basePath, game.css);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace padding inside wrapper block
  const wrapperRegex = new RegExp(`\\${game.wrapper}\\s*\\{[\\s\\S]*?\\}`);
  content = content.replace(wrapperRegex, (match) => {
    // Replace padding if it exists
    if (match.includes('padding:')) {
      match = match.replace(/padding:\s*[^;]+;/, 'padding: 10mm;');
    } else {
      // Insert padding before the closing brace
      match = match.replace(/\}$/, '  padding: 10mm;\n}');
    }
    // Add box-sizing if not exists
    if (!match.includes('box-sizing:')) {
      match = match.replace(/\}$/, '  box-sizing: border-box;\n}');
    }
    return match;
  });
  
  fs.writeFileSync(p, content, 'utf8');
});

console.log("Fixed wrapper paddings globally to 10mm");
