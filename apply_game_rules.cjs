const fs = require('fs');
const path = require('path');

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

// 1. Rompecabezas
let rompePath = path.join(basePath, 'rompecabezas/Rompecabezas.tsx');
let rompeContent = fs.readFileSync(rompePath, 'utf8');
// Fix handleSeleccionarNivel inside Rompecabezas
rompeContent = rompeContent.replace(/const handleSeleccionarNivel = \([\s\S]*?iniciarJuego\(newGridSize, newTime\);\s*\};/, `const handleSeleccionarNivel = (nivel: 'facil'|'medio'|'dificil'|string) => {
    let newGridSize = gridSize;
    let newTime = limiteTiempo;
    if (nivel === 'aprendiz') { setDificultad('facil'); setGridSize(3); newGridSize = 3; setLimiteTiempo(60); newTime = 60; }
    if (nivel === 'talentoso') { setDificultad('medio'); setGridSize(4); newGridSize = 4; setLimiteTiempo(60); newTime = 60; }
    if (nivel === 'maestro') { setDificultad('dificil'); setGridSize(5); newGridSize = 5; setLimiteTiempo(80); newTime = 80; }
    setPantalla('juego');
    iniciarJuego(newGridSize, newTime);
  };`);
fs.writeFileSync(rompePath, rompeContent, 'utf8');

// 2. Memorama
let memoPath = path.join(basePath, 'memorama/Memorama.tsx');
let memoContent = fs.readFileSync(memoPath, 'utf8');
memoContent = memoContent.replace(/aprendiz: { pares: 4, tiempo: \d+ }/, 'aprendiz: { pares: 4, tiempo: 60 }');
memoContent = memoContent.replace(/talentoso: { pares: 6, tiempo: \d+ }/, 'talentoso: { pares: 6, tiempo: 40 }');
memoContent = memoContent.replace(/maestro: { pares: 8, tiempo: \d+ }/, 'maestro: { pares: 8, tiempo: 40 }');
fs.writeFileSync(memoPath, memoContent, 'utf8');

// 3. Reflejos
let refPath = path.join(basePath, 'reflejos/Reflejos.tsx');
let refContent = fs.readFileSync(refPath, 'utf8');
refContent = refContent.replace(/aprendiz: \{ metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: \d+ \}/, 'aprendiz: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: 60 }');
refContent = refContent.replace(/talentoso: \{ metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: \d+ \}/, 'talentoso: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: 40 }');
refContent = refContent.replace(/maestro: \{ metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: \d+ \}/, 'maestro: { metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: 40 }');
refContent = refContent.replace(/const cfg = \{ aprendiz: \{ tiempo: \d+ \}, talentoso: \{ tiempo: \d+ \}, maestro: \{ tiempo: \d+ \} \};/, 'const cfg = { aprendiz: { tiempo: 60 }, talentoso: { tiempo: 40 }, maestro: { tiempo: 40 } };');

// Add fallos losing logic in Reflejos
// Find the first useEffect after iniciarJuego or add a new one.
const fallosEffect = `
  useEffect(() => {
    if (enJuego && (dificultad === 'talentoso' || dificultad === 'maestro') && fallos >= 2 && !haPerdido && !haGanado) {
      setHaPerdido(true);
      setEnJuego(false);
      onResultado(false, '');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [fallos, enJuego, dificultad, haPerdido, haGanado, onResultado]);
`;
if (!refContent.includes("fallos >= 2 && !haPerdido")) {
  refContent = refContent.replace(/(const getPremio =)/, `${fallosEffect}\n  $1`);
  // Update loss message in Reflejos to handle 'fallos'
  refContent = refContent.replace(/<h2>¡Se acabó el tiempo!<\/h2>\s*<p>No lograste atrapar suficientes objetivos a tiempo\.<\/p>/g, `<h2>{fallos >= 2 ? '¡Demasiados fallos!' : '¡Se acabó el tiempo!'}</h2>
              <p>{fallos >= 2 ? 'Has superado el límite de fallos permitidos.' : 'No lograste atrapar suficientes objetivos a tiempo.'}</p>`);
}
fs.writeFileSync(refPath, refContent, 'utf8');

// 4. Secuencia
let secPath = path.join(basePath, 'secuencia/Secuencia.tsx');
let secContent = fs.readFileSync(secPath, 'utf8');
secContent = secContent.replace(/const tiempos = \{ aprendiz: \d+, talentoso: \d+, maestro: \d+ \};/, 'const tiempos = { aprendiz: 40, talentoso: 100, maestro: 160 };');
secContent = secContent.replace(/aprendiz: \{ metaRondas: \d+, intervaloMs: 650 \}/, 'aprendiz: { metaRondas: 6, intervaloMs: 650 }');
secContent = secContent.replace(/talentoso: \{ metaRondas: \d+, intervaloMs: 500 \}/, 'talentoso: { metaRondas: 10, intervaloMs: 500 }');
secContent = secContent.replace(/maestro: \{ metaRondas: \d+, intervaloMs: 380 \}/, 'maestro: { metaRondas: 14, intervaloMs: 380 }');

// Add fallos logic to Secuencia
if (!secContent.includes('const [fallos, setFallos]')) {
  secContent = secContent.replace(/const \[haGanado, setHaGanado\] = useState<boolean>\(false\);/, `const [fallos, setFallos] = useState<number>(0);\n    const [haGanado, setHaGanado] = useState<boolean>(false);`);
  
  // reset fallos on start
  secContent = secContent.replace(/setHaGanado\(false\);/, `setFallos(0);\n      setHaGanado(false);`);
  
  // logic inside handlePadClick
  const oldFailLogic = `      if (padIndex !== secuencia[pasoUsuario]) {
        soundManager.playError();
        setHaFallado(true);
        setTurnoJugador(false);
      }`;
  const newFailLogic = `      if (padIndex !== secuencia[pasoUsuario]) {
        soundManager.playError();
        setFallos(prev => {
          const nuevosFallos = prev + 1;
          if (nuevosFallos >= 2) {
            setHaFallado(true);
            setTurnoJugador(false);
            setEnJuego(false);
            onResultado(false, '');
            if (timerRef.current) clearInterval(timerRef.current);
            return nuevosFallos;
          }
          // Resume! Repeat sequence for them
          setTurnoJugador(false);
          setPasoUsuario(0);
          setTimeout(() => reproducirSecuencia(), 500);
          return nuevosFallos;
        });
      }`;
  secContent = secContent.replace(oldFailLogic, newFailLogic);
  
  // Update fail overlay text to be a proper loss modal
  const oldFailModal = `{haFallado && !haGanado && !haPerdidoTiempo && (
        <div className="fail-overlay">
          <button className="btn-primary-action retry-btn" onClick={() => iniciarJuego()}>Volver a Intentar</button>
        </div>
      )}`;
  const newFailModal = `{haFallado && !haGanado && !haPerdidoTiempo && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
            <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>!</div>
            <h2>¡Has Perdido!</h2>
            <p>Has alcanzado el límite de fallos.</p>
            <div className="victory-btn-group">
              <button className="btn-primary-action" onClick={() => iniciarJuego(limiteTiempo)}>Reintentar</button>
              <button className="btn-secondary-action" onClick={() => setPantalla('config')}>Volver a Configurar</button>
            </div>
          </div>
        </div>
      )}`;
  secContent = secContent.replace(oldFailModal, newFailModal);
  
  // Replace direct haPerdidoTiempo overlay with the standard one
  // ... Actually it already has haPerdidoTiempo overlay, which is fine.
}
fs.writeFileSync(secPath, secContent, 'utf8');

console.log("Updated game rules successfully");
