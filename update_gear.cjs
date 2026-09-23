const fs = require('fs');
const path = require('path');

const games = [
  'rompecabezas/Rompecabezas.tsx',
  'memorama/Memorama.tsx',
  'reflejos/Reflejos.tsx',
  'secuencia/Secuencia.tsx'
];

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

games.forEach(game => {
  const filePath = path.join(basePath, game);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the button we injected and update its style to prevent layout breaking
  // old style string in update_games2.cjs:
  // style={{ position: 'absolute', top: '50%', right: '-60px', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border-light)' }}
  
  content = content.replace(/style=\{\{ position: 'absolute', top: '50%', right: '-60px', transform: 'translateY\(-50%\)', width: '48px'/g, 
  "style={{ position: 'absolute', top: '12px', right: '12px', width: '42px'");

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Updated gear positioning");
