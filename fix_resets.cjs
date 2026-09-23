const fs = require('fs');
const path = require('path');

const refPath = 'C:/THPro-Game/THPro-Game/src/components/reflejos/Reflejos.tsx';

let content = fs.readFileSync(refPath, 'utf8');

// Modify iniciarJuego to accept an optional 'nivel' parameter
content = content.replace(/const iniciarJuego = useCallback\(\(\) => \{/, 'const iniciarJuego = useCallback((nivelOverride?: DificultadReflejos) => {\n      const diff = nivelOverride || dificultad;\n      const currentConfig = { aprendiz: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: 60 }, talentoso: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: 40 }, maestro: { metaAciertos: 30, tiempoObjetivoMs: 1200, tamano: 56, tiempo: 40 } }[diff];');

// Then replace `config.` with `currentConfig.` inside iniciarJuego
// We need to carefully replace just inside iniciarJuego, or use a simpler trick.
// Instead of messing with useCallback, let's just make handleSeleccionarNivel reset everything so the useEffect handles it cleanly!

let newContent = fs.readFileSync(refPath, 'utf8');

const newHandle = `const handleSeleccionarNivel = (nivel: DificultadReflejos) => {
    const cfg = { aprendiz: { tiempo: 60 }, talentoso: { tiempo: 40 }, maestro: { tiempo: 40 } };
    setDificultad(nivel);
    setLimiteTiempo(cfg[nivel].tiempo);
    // Reset all states so useEffect triggers cleanly
    setEnJuego(false);
    setAciertos(0);
    setFallos(0);
    setHaGanado(false);
    setHaPerdido(false);
    setPantalla('juego');
  };`;

newContent = newContent.replace(/const handleSeleccionarNivel = \(nivel: DificultadReflejos\) => \{[\s\S]*?setPantalla\('juego'\);\s*\};/, newHandle);

fs.writeFileSync(refPath, newContent, 'utf8');
console.log("Fixed Reflejos selection");

// Now for Secuencia
const secPath = 'C:/THPro-Game/THPro-Game/src/components/secuencia/Secuencia.tsx';
let secContent = fs.readFileSync(secPath, 'utf8');
const newSecHandle = `const handleSeleccionarNivel = (nivel: DificultadSecuencia) => {
    const tiempos = { aprendiz: 40, talentoso: 100, maestro: 160 };
    setDificultad(nivel);
    setLimiteTiempo(tiempos[nivel]);
    setSecuencia([]);
    setEnJuego(false);
    setHaGanado(false);
    setHaFallado(false);
    setHaPerdidoTiempo(false);
    setPantalla('juego');
    iniciarJuego(tiempos[nivel]);
  };`;
secContent = secContent.replace(/const handleSeleccionarNivel = \(nivel: DificultadSecuencia\) => \{[\s\S]*?iniciarJuego\(tiempos\[nivel\]\);\s*\};/, newSecHandle);
fs.writeFileSync(secPath, secContent, 'utf8');
console.log("Fixed Secuencia selection");

