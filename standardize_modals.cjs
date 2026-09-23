const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';
const games = [
  'rompecabezas/Rompecabezas.tsx',
  'reflejos/Reflejos.tsx',
  'secuencia/Secuencia.tsx',
  'memorama/Memorama.tsx'
];

games.forEach(game => {
  const p = path.join(basePath, game);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  // STANDARDIZE VICTORY
  // Replace the h2 and p combination with a single h2
  content = content.replace(/<h2 style=\{\{ textAlign: "center" \}\}>Ganaste!<\/h2>\s*<p style=\{\{ color: 'var\(--rosa-hover\)', fontWeight: 'bold', fontSize: '1\.2rem', margin: '10px 0' \}\}>\{getPremio\(dificultad\) === '' \? 'Ganaste!' : `Ganaste \$\{getPremio\(dificultad\)\}!`\}<\/p>/g, 
    '<h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "10px 0" }}>{getPremio(dificultad) === \'\' ? \'¡Ganaste!\' : `¡Ganaste ${getPremio(dificultad)}!`}</h2>');
    
  content = content.replace(/<h2 style=\{\{ textAlign: "center" \}\}>¡Ganaste!<\/h2>\s*<p style=\{\{ color: 'var\(--rosa-hover\)', fontWeight: 'bold', fontSize: '1\.2rem', margin: '10px 0' \}\}>\{getPremio\(dificultad\) === '' \? '¡Ganaste!' : `¡Ganaste \$\{getPremio\(dificultad\)\}!`\}<\/p>/g, 
    '<h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "10px 0" }}>{getPremio(dificultad) === \'\' ? \'¡Ganaste!\' : `¡Ganaste ${getPremio(dificultad)}!`}</h2>');
    
  // Also some might not have the inline styles. Let's do a robust replace for the victory modal top part:
  const victoryTopRegex = /<div className="victory-icon-bubble">.*?<\/div>\s*<h2.*?>.*?<\/h2>\s*<p.*?>\{getPremio.*?<\/p>/g;
  content = content.replace(victoryTopRegex, `<div className="victory-icon-bubble">✓</div>\n              <h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "15px 0 20px" }}>{getPremio(dificultad) === '' ? '¡Ganaste!' : \`¡Ganaste \${getPremio(dificultad)}!\`}</h2>`);
  
  // STANDARDIZE LOSS
  // Make the loss screen ONLY have the h2 and the button.
  const lossModalRegex = /<div className="clean-modal-backdrop victory-backdrop">\s*<div className="clean-modal-box victory-box" style=\{\{ borderColor: '#ef4444' \}\}>\s*<div className="victory-icon-bubble" style=\{\{ backgroundColor: '#ef4444', color: '#fff' \}\}>!<\/div>\s*<h2>.*?<\/h2>\s*<p>.*?<\/p>\s*<div className="victory-btn-group">\s*<button className="btn-primary-action" onClick=\{onVolver\}>Volver al Men<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  content = content.replace(lossModalRegex, `<div className="clean-modal-backdrop victory-backdrop">\n            <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>\n              <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>X</div>\n              <h2 style={{ textAlign: "center", margin: "15px 0 25px" }}>¡Perdiste!</h2>\n              <div className="victory-btn-group">\n                <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>\n              </div>\n            </div>\n          </div>`);
  
  const lossModalRegex2 = /<div className="clean-modal-backdrop victory-backdrop">\s*<div className="clean-modal-box victory-box" style=\{\{ borderColor: '#ef4444' \}\}>\s*<div className="victory-icon-bubble" style=\{\{ backgroundColor: '#ef4444', color: '#fff' \}\}>!<\/div>\s*<h2>.*?<\/h2>\s*<p>.*?<\/p>\s*<div className="victory-btn-group">\s*<button className="btn-primary-action" onClick=\{onVolver\}>Volver al Menú<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  content = content.replace(lossModalRegex2, `<div className="clean-modal-backdrop victory-backdrop">\n            <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>\n              <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>X</div>\n              <h2 style={{ textAlign: "center", margin: "15px 0 25px" }}>¡Perdiste!</h2>\n              <div className="victory-btn-group">\n                <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>\n              </div>\n            </div>\n          </div>`);
  
  // Specifically for Reflejos because it uses a conditional in the <p> tag: `<p>{fallos >= 2 ? ... : ...}</p>`
  const lossModalReflejos = /<div className="clean-modal-backdrop victory-backdrop">\s*<div className="clean-modal-box victory-box" style=\{\{ borderColor: '#ef4444' \}\}>\s*<div className="victory-icon-bubble" style=\{\{ backgroundColor: '#ef4444', color: '#fff' \}\}>!<\/div>\s*<h2>.*?<\/h2>\s*<p>\{fallos >= 2 \? .*? : .*?\}<\/p>\s*<div className="victory-btn-group">\s*<button className="btn-primary-action" onClick=\{onVolver\}>Volver al Men.*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  content = content.replace(lossModalReflejos, `<div className="clean-modal-backdrop victory-backdrop">\n            <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>\n              <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>X</div>\n              <h2 style={{ textAlign: "center", margin: "15px 0 25px" }}>¡Perdiste!</h2>\n              <div className="victory-btn-group">\n                <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>\n              </div>\n            </div>\n          </div>`);

  fs.writeFileSync(p, content, 'utf8');
});

console.log("Standardized victory and loss screens");
