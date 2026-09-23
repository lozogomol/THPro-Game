const fs = require('fs');
const path = require('path');

const games = [
  'memorama/Memorama.tsx',
  'reflejos/Reflejos.tsx',
  'secuencia/Secuencia.tsx'
];

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

games.forEach(game => {
  const filePath = path.join(basePath, game);
  let content = fs.readFileSync(filePath, 'utf8');

  if (game.includes('Memorama')) {
    content = content.replace(/setTiempoSegundos\(limiteTiempo > 0 \? limiteTiempo : 0\);/, 'setTiempoSegundos(config.tiempo > 0 ? config.tiempo : 0);');
  } else if (game.includes('Reflejos')) {
    // In Reflejos, config has `tiempo`
    content = content.replace(/setTiempoSegundos\(limiteTiempo > 0 \? limiteTiempo : 0\);/, 'setTiempoSegundos(config.tiempo > 0 ? config.tiempo : 0);');
  } else if (game.includes('Secuencia')) {
    // In Secuencia, config might be `tiempos[nivel]`
    // Wait, Secuencia does NOT use countdown timer the same way! Let's check Secuencia manually.
    // Secuencia might not use time limit, but if it does we'll leave it or replace it.
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Updated timers");
