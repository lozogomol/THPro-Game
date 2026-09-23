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
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the old button with the new naked icon button
  // We need to match the previous button inject.
  // The old style started with: style={{ position: 'absolute', top: '12px', right: '12px', width: '42px', ...
  // Actually, I can just use a regex to replace the entire <button className="btn-icon-config-side" ... </button>
  const gearSVG = `<button className="btn-icon-config-side" onClick={() => setPantalla('config')} title="Volver a Configuración" style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 10 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button>`;
  
  content = content.replace(/<button\s+className="btn-icon-config-side"[\s\S]*?<\/button>/, gearSVG);

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log("Fixed gears");
