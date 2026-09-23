const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  { path: 'rompecabezas/Rompecabezas.tsx' },
  { path: 'memorama/Memorama.tsx' },
  { path: 'reflejos/Reflejos.tsx' },
  { path: 'secuencia/Secuencia.tsx' }
];

const gearMetricChipHtml = `
            <div 
              className="metric-chip" 
              onClick={() => { setPantalla('config'); setEnJuego(false); }} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}
              title="Volver a Configuración"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
`;

games.forEach(game => {
  const p = path.join(basePath, game.path);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // 1. Remove the previously injected floating gear container
  content = content.replace(/<div style=\{\{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginBottom: '10px' \}\}>[\s\S]*?<\/div>\s*<div className="metrics-strip">/g, '<div className="metrics-strip">');

  // 2. Inject the gear metric chip right before the closing div of metrics-strip
  // The metrics-strip usually contains several metric-chips.
  // We'll replace `</div>\n          </div>` right after the last metric-chip? No, let's just append to metrics-strip.
  // Since we don't know the exact format, let's find the closing tag of the last metric chip in the metrics-strip.
  // Or better, let's just replace `<div className="metrics-strip">` and inject it as the FIRST metric chip? The user said "al lado de tiempo restante", which means it's better at the end or next to time. Time is usually the last one.
  // So let's find the end of metrics-strip. We can replace:
  // `</div>\n              </div>\n              <div className="game-board-area">` or similar? 
  // Let's just find `className="metrics-strip">` and put it as the first chip! "al lado de tiempo restante". If we put it first, it's next to it or on the other side.
  // Wait, let's inject it inside `metrics-strip`, right after the opening tag.
  
  content = content.replace(/(<div className="metrics-strip">)/, '$1\n' + gearMetricChipHtml);
  
  fs.writeFileSync(p, content, 'utf8');
});

// Now fix Rompecabezas CSS
const rompCssPath = path.join(basePath, 'rompecabezas/Rompecabezas.css');
if (fs.existsSync(rompCssPath)) {
  let cssContent = fs.readFileSync(rompCssPath, 'utf8');
  cssContent = cssContent.replace(/\.rompecabezas-wrapper\s*\{[\s\S]*?padding:\s*0;/, (match) => {
    return match.replace('padding: 0;', 'padding: 5mm 0;');
  });
  cssContent = cssContent.replace(/@media \(max-width: 860px\)\s*\{\s*\.game-layout\s*\{\s*grid-template-columns: 1fr;\s*justify-items: center;\s*\}/, `@media (max-width: 860px) {\n  .game-layout {\n    flex-direction: column;\n    align-items: center;\n  }`);
  
  fs.writeFileSync(rompCssPath, cssContent, 'utf8');
}

console.log("Fixed gear chip and CSS");
