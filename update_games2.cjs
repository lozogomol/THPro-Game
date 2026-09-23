const fs = require('fs');
const path = require('path');

const games = [
  'rompecabezas/Rompecabezas.tsx',
  'memorama/Memorama.tsx',
  'reflejos/Reflejos.tsx',
  'secuencia/Secuencia.tsx'
];

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

const sideGear = `
  <button 
    className="btn-icon-config-side" 
    onClick={() => setPantalla('config')} 
    title="Volver a Configuración" 
    style={{ position: 'absolute', top: '50%', right: '-60px', transform: 'translateY(-50%)', width: '48px', height: '48px', borderRadius: '50%', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border-light)' }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  </button>
`;

games.forEach(game => {
  const filePath = path.join(basePath, game);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove old gear from metrics-strip
  content = content.replace(/<button className="btn-icon-config"[\s\S]*?<\/button>/, '');
  
  // 2. Add side gear to the main card
  // First, ensure the card has position relative if needed, but we can just inject inline style.
  if (game.includes('Rompecabezas')) {
    content = content.replace(/<div className="board-container-card">/, '<div className="board-container-card" style={{ position: \'relative\' }}>' + sideGear);
  } else if (game.includes('Memorama')) {
    content = content.replace(/<div className="memorama-board-card">/, '<div className="memorama-board-card" style={{ position: \'relative\' }}>' + sideGear);
  } else if (game.includes('Reflejos')) {
    content = content.replace(/<div className="reflex-card">/, '<div className="reflex-card" style={{ position: \'relative\' }}>' + sideGear);
  } else if (game.includes('Secuencia')) {
    content = content.replace(/<div className="secuencia-card">/, '<div className="secuencia-card" style={{ position: \'relative\' }}>' + sideGear);
  }

  // 3. Fix times
  if (game.includes('Memorama')) {
    content = content.replace(/aprendiz: { pares: 4, tiempo: \d+ }/, 'aprendiz: { pares: 4, tiempo: 60 }');
    content = content.replace(/talentoso: { pares: 6, tiempo: \d+ }/, 'talentoso: { pares: 6, tiempo: 90 }');
    content = content.replace(/maestro: { pares: 8, tiempo: \d+ }/, 'maestro: { pares: 8, tiempo: 120 }');
  } else if (game.includes('Reflejos')) {
    content = content.replace(/aprendiz: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: \d+ }/, 'aprendiz: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: 60 }');
    content = content.replace(/talentoso: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: \d+ }/, 'talentoso: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: 90 }');
    content = content.replace(/maestro: { metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: \d+ }/, 'maestro: { metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: 120 }');
    content = content.replace(/const cfg = { aprendiz: { tiempo: \d+ }, talentoso: { tiempo: \d+ }, maestro: { tiempo: \d+ } };/, 'const cfg = { aprendiz: { tiempo: 60 }, talentoso: { tiempo: 90 }, maestro: { tiempo: 120 } };');
  } else if (game.includes('Secuencia')) {
    content = content.replace(/const tiempos = { aprendiz: \d+, talentoso: \d+, maestro: \d+ };/, 'const tiempos = { aprendiz: 60, talentoso: 90, maestro: 120 };');
  } else if (game.includes('Rompecabezas')) {
    content = content.replace(/setLimiteTiempo\(240\)/, 'setLimiteTiempo(60)');
    content = content.replace(/setLimiteTiempo\(120\)/, 'setLimiteTiempo(90)'); // Only replaces first 120 (talentoso)
    // to be safe, exact replace:
    content = content.replace(/if \(nivel === 'talentoso'\) { setDificultad\('medio'\); setGridSize\(4\); setLimiteTiempo\(\d+\); }/, 'if (nivel === \'talentoso\') { setDificultad(\'medio\'); setGridSize(4); setLimiteTiempo(90); }');
    content = content.replace(/if \(nivel === 'maestro'\) { setDificultad\('dificil'\); setGridSize\(5\); setLimiteTiempo\(\d+\); }/, 'if (nivel === \'maestro\') { setDificultad(\'dificil\'); setGridSize(5); setLimiteTiempo(120); }');
    
    // Fix Rompecabezas reset issue:
    // Change handleSeleccionarNivel to reset everything and call iniciarJuego
    const newHandleSeleccionarNivel = `const handleSeleccionarNivel = (nivel: 'facil'|'medio'|'dificil'|string) => {
    let newGridSize = gridSize;
    let newTime = limiteTiempo;
    if (nivel === 'aprendiz') { setDificultad('facil'); setGridSize(3); newGridSize = 3; setLimiteTiempo(60); newTime = 60; }
    if (nivel === 'talentoso') { setDificultad('medio'); setGridSize(4); newGridSize = 4; setLimiteTiempo(90); newTime = 90; }
    if (nivel === 'maestro') { setDificultad('dificil'); setGridSize(5); newGridSize = 5; setLimiteTiempo(120); newTime = 120; }
    setPantalla('juego');
    iniciarJuego(newGridSize, newTime);
  };`;
    content = content.replace(/const handleSeleccionarNivel = \(nivel: 'facil'\|'medio'\|'dificil'\|string\) => \{[\s\S]*?setPantalla\('juego'\);\s*\};/, newHandleSeleccionarNivel);
    
    // Update iniciarJuego signature to accept forcedTime
    content = content.replace(/const iniciarJuego = \(forcedGridSize\?: number\) => \{/, 'const iniciarJuego = (forcedGridSize?: number, forcedTime?: number) => {');
    // And set the time correctly
    content = content.replace(/setTiempoSegundos\(0\);/, 'setTiempoSegundos(forcedTime !== undefined ? forcedTime : limiteTiempo);');
    // Set other states to reset
    content = content.replace(/setMovimientos\(0\);/, 'setMovimientos(0);\n    setHaGanado(false);\n    setHaPerdidoTiempo(false);\n    setEnJuego(true);');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${game}`);
});
