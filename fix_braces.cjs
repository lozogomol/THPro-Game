const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { path: 'rompecabezas/Rompecabezas.tsx' },
  { path: 'memorama/Memorama.tsx' },
  { path: 'reflejos/Reflejos.tsx' },
  { path: 'secuencia/Secuencia.tsx' }
];

games.forEach(game => {
  const filePath = path.join(basePath, game.path);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the extra closing brace from the previous lazy regex replace
  content = content.replace(/style=\{\{ cursor: 'pointer', order: 99 \}\}\}/g, "style={{ cursor: 'pointer', order: 99 }}");
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fixed extra closing braces");
