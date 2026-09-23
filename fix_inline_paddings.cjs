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
  
  // Replace inline padding: '10mm' with padding: '5mm'
  content = content.replace(/padding:\s*'10mm'/g, "padding: '5mm'");
  
  fs.writeFileSync(p, content, 'utf8');
});

// Also Memorama config-box needs max-width: 100% (it might have had an inline max-width too? No, it was in CSS).
// In Rompecabezas we had style={{ width: '100%', maxWidth: '350px' }} which I changed to maxWidth: '100%'. 
// Wait, the user said "hazlo mas anchos las tarjetas de nivel y demas".
// A config screen of 100% on desktop is 1200px.
// Let's cap them at 800px max-width in CSS, but the prompt says "que se expandan pero los limites con un marco de 10mm". On mobile they will fill. On desktop they fill up to 1200px, which is acceptable since it's responsive. But let's add `maxWidth: '800px'` just so they don't look completely broken on ultra-wides, or leave it 100%. The prompt just says "que se expandan". Let's leave it 100% as I did.

console.log("Fixed inline paddings to 5mm");
