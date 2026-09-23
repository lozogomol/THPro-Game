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

  // Replace various victory headers with ¡Ganaste!
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>¡Rompecabeza<br \/>THPro S.R.L. Completado!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>¡Memorama<br \/>THPro S.R.L. Completado!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>¡Reflejos<br \/>THPro S.R.L. Completado!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>¡Secuencia<br \/>THPro S.R.L. Completada!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');

  // Also replace any mangled accents just in case
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>Rompecabeza<br \/>THPro S.R.L. Completado!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>Memorama<br \/>THPro S.R.L. Completado!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>Reflejos<br \/>THPro S.R.L. Completado!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');
  content = content.replace(/<h2 style={{ textAlign: 'center' }}>Secuencia<br \/>THPro S.R.L. Completada!<\/h2>/g, '<h2 style={{ textAlign: "center" }}>¡Ganaste!</h2>');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fixed ganaste headers");
