const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { tsx: 'rompecabezas/Rompecabezas.tsx' },
  { tsx: 'memorama/Memorama.tsx' },
  { tsx: 'reflejos/Reflejos.tsx' },
  { tsx: 'secuencia/Secuencia.tsx' }
];

games.forEach(game => {
  const tsxPath = path.join(basePath, game.tsx);
  if (fs.existsSync(tsxPath)) {
    let tsxContent = fs.readFileSync(tsxPath, 'utf8');
    tsxContent = tsxContent.replace(/style=\{\{ cursor: 'pointer', order: 99, padding: '0 20px' \}\}/g, "style={{ cursor: 'pointer', order: 99 }}");
    fs.writeFileSync(tsxPath, tsxContent, 'utf8');
  }
});

console.log("Fixed chip inline styles");
