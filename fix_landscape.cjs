const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  'rompecabezas/Rompecabezas.css',
  'reflejos/Reflejos.css',
  'secuencia/Secuencia.css',
  'memorama/Memorama.css'
];

games.forEach(game => {
  const p = path.join(basePath, game);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // 1. If there is a media query forcing flex-direction: column on game-layout without orientation, fix it.
  content = content.replace(/@media\s*\(\s*max-width:\s*860px\s*\)\s*\{\s*\.game-layout\s*\{\s*flex-direction:\s*column;/g, 
    `@media (max-width: 860px) and (orientation: portrait) {\n  .game-layout {\n    flex-direction: column;`);
  
  // 2. Add flex-wrap: wrap to game-layout by default
  content = content.replace(/\.game-layout\s*\{[\s\S]*?\}/, match => {
    if (!match.includes('flex-wrap')) {
      return match.replace(/align-items:\s*center;/, 'align-items: center;\n  flex-wrap: wrap;');
    }
    return match;
  });

  fs.writeFileSync(p, content, 'utf8');
});

console.log("Fixed landscape layout breaking by adding flex-wrap and targeting media queries to portrait");
