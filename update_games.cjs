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

  // 1. Add tuerquita icon in metrics-strip
  // We need to inject the tuerquita button next to the other metrics or replace the "Configurar" button.
  // First remove the old Configurar button if it exists
  content = content.replace(/<button className="btn-secondary-action reset-btn" onClick=\{.*?setPantalla\('config'\).*?\}>Configurar<\/button>/g, '');
  
  // Now add the tuerquita inside metrics-strip
  // We'll append it right before the closing </div> of metrics-strip
  const tuerquitaSVG = `<button className="btn-icon-config" onClick={() => setPantalla('config')} title="Volver a Configuración" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button>`;
  
  content = content.replace(/(<div className="metrics-strip">[\s\S]*?)<\/div>\s*(<div className="[\w\s-]*grid-frame"|<div className="memorama-board|<div className={`cartas-grid|<div className="reflex-area|<div className="sequence-stage)/, `$1  ${tuerquitaSVG}\n          </div>\n          $2`);
  
  // Also check if we missed any metrics-strip replacement
  if (!content.includes('btn-icon-config')) {
      content = content.replace(/(<div className="metrics-strip">[\s\S]*?)<\/div>\s*<div/, `$1  ${tuerquitaSVG}\n          </div>\n          <div`);
  }

  // 2. Modify getPremio logic
  const newGetPremio = `const getPremio = (dif: string) => {
    if (dif === 'facil' || dif === 'aprendiz') return '';
    if (dif === 'medio' || dif === 'talentoso') return 'un premio';
    if (dif === 'dificil' || dif === 'maestro') return 'Masaje Exprés';
    return '';
  };`;
  content = content.replace(/const getPremio = \(dif: string\) => \{[\s\S]*?\};/, newGetPremio);

  // 3. Update ¡Ganaste {getPremio(dificultad)}! to conditional logic
  content = content.replace(/¡Ganaste \{getPremio\(dificultad\)\}!/g, `{getPremio(dificultad) === '' ? '¡Ganaste!' : \`¡Ganaste \${getPremio(dificultad)}!\`}`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${game}`);
});

// Now let's handle Rompecabezas specific styling for the config box (buttons and card breaking)
const rompePath = path.join(basePath, 'rompecabezas/Rompecabezas.tsx');
let rompeContent = fs.readFileSync(rompePath, 'utf8');

// The config box for image selection: "lo del rompecabeza que no se rompan l atarjeta por las imagenes, muy grande los botone de izquierda a derecha de la imagen"
// Currently:
// <div className="config-box clean-modal-box" style={{ flex: '0 1 320px', width: '320px', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
// <button className="btn-secondary-action" style={{ padding: '8px 16px', fontSize: '1.2rem', minWidth: '45px' }} ...>
// <img src={imagenActual.url} ... style={{ width: '100%', height: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block' }} />

rompeContent = rompeContent.replace(/<div className="config-box clean-modal-box" style=\{\{ flex: '0 1 320px', width: '320px', minHeight: '340px', display: 'flex', flexDirection: 'column' \}\}>/g, `<div className="config-box clean-modal-box" style={{ flex: '0 1 320px', width: '320px', height: '340px', minHeight: '340px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>`);

// Reduce button sizes
rompeContent = rompeContent.replace(/padding: '8px 16px', fontSize: '1\.2rem', minWidth: '45px'/g, `padding: '4px 8px', fontSize: '1rem', minWidth: '35px'`);

// Make image container not break out
rompeContent = rompeContent.replace(/maxHeight: '200px'/g, `maxHeight: '160px'`);

fs.writeFileSync(rompePath, rompeContent, 'utf8');
console.log('Updated Rompecabezas specific styling');
