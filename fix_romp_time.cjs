const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

// Fix duplicated lines and setTiempoSegundos to use forcedTime
const regex = /setHaGanado\(false\);\s*setHaPerdidoTiempo\(false\);\s*setEnJuego\(true\);\s*setTiempoSegundos\(limiteTiempo > 0 \? limiteTiempo : 0\);\s*setHaGanado\(false\);\s*setHaPerdidoTiempo\(false\);\s*setEnJuego\(true\);\s*setPantalla\('juego'\);/g;

if (regex.test(content)) {
  content = content.replace(regex, `setHaGanado(false);
    setHaPerdidoTiempo(false);
    setEnJuego(true);
    setTiempoSegundos(forcedTime !== undefined ? forcedTime : (limiteTiempo > 0 ? limiteTiempo : 0));
    setPantalla('juego');`);
} else {
  // If not exactly matching the duplicate block, just find setTiempoSegundos
  content = content.replace(/setTiempoSegundos\(limiteTiempo > 0 \? limiteTiempo : 0\);/g, 'setTiempoSegundos(forcedTime !== undefined ? forcedTime : (limiteTiempo > 0 ? limiteTiempo : 0));');
}

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Fixed Rompecabezas time initialization");
