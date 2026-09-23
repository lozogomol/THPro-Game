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
    // We want to replace the exact style block on config-chip
    tsxContent = tsxContent.replace(/className="metric-chip config-chip"\s*onClick=\{[\s\S]*?\}\s*style=\{[\s\S]*?\}/g, (match) => {
      return match.replace(/style=\{[\s\S]*?\}/, "style={{ cursor: 'pointer', order: 99 }}");
    });
    fs.writeFileSync(tsxPath, tsxContent, 'utf8');
  }
});

console.log("Fixed config chip styles properly");
