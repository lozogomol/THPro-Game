const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

// 1. Fix Maestro time in Reflejos
const refPath = path.join(basePath, 'reflejos/Reflejos.tsx');
let refContent = fs.readFileSync(refPath, 'utf8');
refContent = refContent.replace(/maestro: \{ metaAciertos: 30, tiempoObjetivoMs: 1100, tamano: 56, tiempo: \d+ \}/, 'maestro: { metaAciertos: 30, tiempoObjetivoMs: 1100, tamano: 56, tiempo: 40 }');
fs.writeFileSync(refPath, refContent, 'utf8');

// 2. Fix gear styling globally
const games = [
  'rompecabezas/Rompecabezas.tsx',
  'memorama/Memorama.tsx',
  'reflejos/Reflejos.tsx',
  'secuencia/Secuencia.tsx'
];

games.forEach(game => {
  const p = path.join(basePath, game);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // Find the global-gear-btn inline style and change absolute to fixed, and adjust top
  content = content.replace(/style=\{\{ position: 'absolute', top: '16px', right: '24px'/g, "style={{ position: 'fixed', top: '80px', right: '24px'");
  
  fs.writeFileSync(p, content, 'utf8');
});

console.log("Fixed Reflejos maestro time and gear positions");
