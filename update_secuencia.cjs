const fs = require('fs');
const path = require('path');

const file = 'C:/THPro-Game/THPro-Game/src/components/secuencia/Secuencia.tsx';
let content = fs.readFileSync(file, 'utf8');

// Change iniciarJuego to accept forcedTime
content = content.replace(/const iniciarJuego = \(\) => \{/, 'const iniciarJuego = (forcedTime?: number) => {');
content = content.replace(/setTiempoSegundos\(limiteTiempo > 0 \? limiteTiempo : 0\);/, 'setTiempoSegundos(forcedTime !== undefined ? forcedTime : (limiteTiempo > 0 ? limiteTiempo : 0));');

// Call iniciarJuego with forcedTime in handleSeleccionarNivel
content = content.replace(/const handleSeleccionarNivel = \(nivel: DificultadSecuencia\) => \{[\s\S]*?setPantalla\('juego'\);\s*\};/, `const handleSeleccionarNivel = (nivel: DificultadSecuencia) => {
    const tiempos = { aprendiz: 60, talentoso: 90, maestro: 120 };
    setDificultad(nivel);
    setLimiteTiempo(tiempos[nivel]);
    setSecuencia([]);
    setPantalla('juego');
    iniciarJuego(tiempos[nivel]);
  };`);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated Secuencia");
