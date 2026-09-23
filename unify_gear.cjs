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
      </button>
`;

games.forEach(game => {
  const filePath = path.join(basePath, game.path);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove all old gears
  content = content.replace(/<button[^>]*btn-icon-config-side[^>]*>[\s\S]*?<\/button>/g, '');
  content = content.replace(/<button[^>]*btn-icon-config[^>]*>[\s\S]*?<\/button>/g, '');
  content = content.replace(/<button[^>]*global-gear-btn[^>]*>[\s\S]*?<\/button>/g, '');

  // 2. Inject cleanGearBtn inside the main game wrapper
  const regex = new RegExp('<div className="' + game.wrapper + '(.*?)"(.*?)>');
  content = content.replace(regex, (match, p1, p2) => {
    if (match.includes('style=')) {
      return match;
    }
    return '<div className="' + game.wrapper + p1 + '" style={{ position: "relative", width: "100%", minHeight: "100%" }}' + p2 + '>';
  });
  
  const parts = content.split('return (');
  if (parts.length > 1) {
    const lastReturnIndex = parts.length - 1;
    let mainReturn = parts[lastReturnIndex];
    
    const wrapperPattern = new RegExp('(<div className="' + game.wrapper + '.*?>)');
    if (wrapperPattern.test(mainReturn)) {
      mainReturn = mainReturn.replace(wrapperPattern, '$1\\n' + cleanGearBtn);
    } else {
      mainReturn = mainReturn.replace(/(<div.*?>)/, '$1\\n' + cleanGearBtn);
    }
    
    parts[lastReturnIndex] = mainReturn;
    content = parts.join('return (');
  }

  // 3. Ensure times
  if (game.path.includes('Rompecabezas')) {
    const rep1 = /if \\(nivel === 'aprendiz'\\) \\{ setDificultad\\('facil'\\); setGridSize\\(3\\); newGridSize = 3; setLimiteTiempo\\(\\d+\\); newTime = \\d+; \\}/;
    const rep2 = /if \\(nivel === 'talentoso'\\) \\{ setDificultad\\('medio'\\); setGridSize\\(4\\); newGridSize = 4; setLimiteTiempo\\(\\d+\\); newTime = \\d+; \\}/;
    const rep3 = /if \\(nivel === 'maestro'\\) \\{ setDificultad\\('dificil'\\); setGridSize\\(5\\); newGridSize = 5; setLimiteTiempo\\(\\d+\\); newTime = \\d+; \\}/;
    
    content = content.replace(rep1, "if (nivel === 'aprendiz') { setDificultad('facil'); setGridSize(3); newGridSize = 3; setLimiteTiempo(60); newTime = 60; }");
    content = content.replace(rep2, "if (nivel === 'talentoso') { setDificultad('medio'); setGridSize(4); newGridSize = 4; setLimiteTiempo(60); newTime = 60; }");
    content = content.replace(rep3, "if (nivel === 'maestro') { setDificultad('dificil'); setGridSize(5); newGridSize = 5; setLimiteTiempo(80); newTime = 80; }");
    // Also let's fix it by exact string replacement to be perfectly safe
    content = content.replace(/if \(nivel === 'aprendiz'\) \{ setDificultad\('facil'\); setGridSize\(3\); newGridSize = 3; setLimiteTiempo\(\d+\); newTime = \d+; \}/, "if (nivel === 'aprendiz') { setDificultad('facil'); setGridSize(3); newGridSize = 3; setLimiteTiempo(60); newTime = 60; }");
    content = content.replace(/if \(nivel === 'talentoso'\) \{ setDificultad\('medio'\); setGridSize\(4\); newGridSize = 4; setLimiteTiempo\(\d+\); newTime = \d+; \}/, "if (nivel === 'talentoso') { setDificultad('medio'); setGridSize(4); newGridSize = 4; setLimiteTiempo(60); newTime = 60; }");
    content = content.replace(/if \(nivel === 'maestro'\) \{ setDificultad\('dificil'\); setGridSize\(5\); newGridSize = 5; setLimiteTiempo\(\d+\); newTime = \d+; \}/, "if (nivel === 'maestro') { setDificultad('dificil'); setGridSize(5); newGridSize = 5; setLimiteTiempo(80); newTime = 80; }");
  }
  
  if (game.path.includes('Memorama')) {
    content = content.replace(/aprendiz: \{ pares: 4, tiempo: \d+ \}/, "aprendiz: { pares: 4, tiempo: 60 }");
    content = content.replace(/talentoso: \{ pares: 6, tiempo: \d+ \}/, "talentoso: { pares: 6, tiempo: 40 }");
    content = content.replace(/maestro: \{ pares: 8, tiempo: \d+ \}/, "maestro: { pares: 8, tiempo: 40 }");
  }

  if (game.path.includes('Reflejos')) {
    content = content.replace(/aprendiz: \{ metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: \d+ \}/, 'aprendiz: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: 60 }');
    content = content.replace(/talentoso: \{ metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: \d+ \}/, 'talentoso: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: 40 }');
    content = content.replace(/maestro: \{ metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: \d+ \}/, 'maestro: { metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: 40 }');
    content = content.replace(/const cfg = \{ aprendiz: \{ tiempo: \d+ \}, talentoso: \{ tiempo: \d+ \}, maestro: \{ tiempo: \d+ \} \};/, 'const cfg = { aprendiz: { tiempo: 60 }, talentoso: { tiempo: 40 }, maestro: { tiempo: 40 } };');
  }

  if (game.path.includes('Secuencia')) {
    content = content.replace(/const tiempos = \{ aprendiz: \d+, talentoso: \d+, maestro: \d+ \};/, 'const tiempos = { aprendiz: 40, talentoso: 100, maestro: 160 };');
  }

  // Ensure returning to config forces re-init properly, we added setEnJuego(false) in the gear onClick!

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Unified gear and perfect times applied v2");
