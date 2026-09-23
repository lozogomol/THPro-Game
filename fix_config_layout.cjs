const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
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
  
  // Replace padding: '40mm' with padding: '10mm'
  content = content.replace(/padding:\s*'40mm'/g, "padding: '10mm'");
  // Also fix the gap: '40mm' in Rompecabezas to '20px' or something reasonable
  content = content.replace(/gap:\s*'40mm'/g, "gap: '20px'");
  
  // Replace flexDirection: 'column' with a grid layout for difficulty pills
  content = content.replace(/className="difficulty-pill-group"\s+style=\{\{\s*flexDirection:\s*'column',\s*gap:\s*'12px'\s*\}\}/g, `className="difficulty-pill-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}`);
  
  fs.writeFileSync(p, content, 'utf8');
});

console.log("Fixed config screen paddings and difficulty layout");
