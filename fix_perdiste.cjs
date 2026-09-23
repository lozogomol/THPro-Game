const fs = require('fs');
const path = require('path');

const games = [
  { path: 'rompecabezas/Rompecabezas.tsx' },
  { path: 'memorama/Memorama.tsx' },
  { path: 'reflejos/Reflejos.tsx' },
  { path: 'secuencia/Secuencia.tsx' }
];

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

games.forEach(game => {
  const filePath = path.join(basePath, game.path);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace various loss headers with ¡Perdiste!
  content = content.replace(/<h2>¡Se acabó el tiempo!<\/h2>/g, '<h2>¡Perdiste!</h2>');
  content = content.replace(/<h2>¡Has Perdido!<\/h2>/g, '<h2>¡Perdiste!</h2>');
  content = content.replace(/<h2>\{fallos >= 2 \? '¡Demasiados fallos!' : '¡Se acabó el tiempo!'\}<\/h2>/g, '<h2>¡Perdiste!</h2>');
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fixed perdiste headers");
