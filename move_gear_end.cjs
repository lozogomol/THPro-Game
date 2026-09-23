const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { path: 'rompecabezas/Rompecabezas.tsx' },
  { path: 'memorama/Memorama.tsx' },
  { path: 'reflejos/Reflejos.tsx' },
  { path: 'secuencia/Secuencia.tsx' }
];

const gearChip = `
            <div 
              className="metric-chip config-chip" 
              onClick={() => { setPantalla('config'); setEnJuego(false); }} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
              title="Volver a Configuración"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>`;

function moveGearToEndOfMetrics(content) {
  // First, completely strip the existing gear chip.
  // It has `className="metric-chip" onClick={() => { setPantalla('config');`
  // Wait, I just changed it to `className="metric-chip config-chip"`, but before it was `className="metric-chip"`.
  const stripRegex = /<div\s+className="metric-chip(?: config-chip)?"\s+onClick=\{\(\) => \{\s*setPantalla\('config'\);\s*setEnJuego\(false\);\s*\}\}[\s\S]*?<\/svg>\s*<\/div>/g;
  content = content.replace(stripRegex, '');

  // Now find <div className="metrics-strip"> and append gearChip before its closing </div>
  let startIndex = content.indexOf('<div className="metrics-strip">');
  if (startIndex === -1) return content;
  
  let depth = 0;
  let i = startIndex;
  while (i < content.length) {
    if (content.substr(i, 4) === '<div') {
      depth++;
      i += 4;
    } else if (content.substr(i, 6) === '</div') {
      depth--;
      if (depth === 0) {
        // We found the closing div of metrics-strip
        content = content.substring(0, i) + gearChip + '\n      ' + content.substring(i);
        break;
      }
      i += 6;
    } else {
      i++;
    }
  }
  return content;
}

games.forEach(game => {
  const p = path.join(basePath, game.path);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  content = moveGearToEndOfMetrics(content);
  fs.writeFileSync(p, content, 'utf8');
});

console.log("Moved gear to end of metrics strip");
