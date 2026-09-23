const fs = require('fs');
const path = require('path');

const games = [
  { path: 'rompecabezas/Rompecabezas.tsx', wrapper: 'rompecabezas-wrapper' },
  { path: 'memorama/Memorama.tsx', wrapper: 'memorama-wrapper' },
  { path: 'reflejos/Reflejos.tsx', wrapper: 'reflejos-wrapper' },
  { path: 'secuencia/Secuencia.tsx', wrapper: 'secuencia-wrapper' }
];

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

const cleanGearBtn = `
      <button 
        className="global-gear-btn" 
        onClick={() => {
          setPantalla('config');
          setEnJuego(false);
        }} 
        title="Volver a Configuración" 
        style={{ position: 'absolute', top: '16px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 1000 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>`;

games.forEach(game => {
  const filePath = path.join(basePath, game.path);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove all gears
  content = content.replace(/<button[^>]*global-gear-btn[^>]*>[\s\S]*?<\/button>/g, '');
  
  // 2. Inject gear correctly
  // We search for `<div className="${game.wrapper}"` that doesn't have `config-screen`
  const wrapperRegex = new RegExp('(<div\\s+className=["\']' + game.wrapper + '(?![^>]*config-screen)[^>]*>)');
  content = content.replace(wrapperRegex, '$1' + cleanGearBtn);
  
  // 3. Fix victory-btn-group to strictly have only "Volver al Menú"
  // Note: we want to preserve the config screen's victory-btn-group which also has Volver al Menú, so replacing all is fine if we replace with the exact same thing.
  const btnGroupRegex = /<div className="victory-btn-group"[^>]*>[\s\S]*?<\/div>/g;
  content = content.replace(btnGroupRegex, (match) => {
    // If it's the config screen button, it might have style={{ marginTop: '20px' }}
    if (match.includes('marginTop')) {
      return `<div className="victory-btn-group" style={{ marginTop: '20px' }}>
              <button className="btn-secondary-action" onClick={onVolver}>Volver al Menú</button>
            </div>`;
    }
    return `<div className="victory-btn-group">
              <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>
            </div>`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fixed gears and buttons");
