const fs = require('fs');
const path = require('path');

// 1. Fix Rompecabezas unused tileSize
const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let rompContent = fs.readFileSync(rompPath, 'utf8');
rompContent = rompContent.replace(/const boardPixelSize = 270;\s*const tileSize = Math\.floor\(boardPixelSize \/ gridSize\);\s*/, '');
rompContent = rompContent.replace(/const tileSize = Math\.floor\(boardPixelSize \/ gridSize\);\s*/, '');
fs.writeFileSync(rompPath, rompContent, 'utf8');

// 2. Fix Secuencia unused fallos
const secPath = 'C:/THPro-Game/THPro-Game/src/components/secuencia/Secuencia.tsx';
let secContent = fs.readFileSync(secPath, 'utf8');
secContent = secContent.replace(/const \[fallos, setFallos\] = useState<number>\(0\);/, 'const [, setFallos] = useState<number>(0);');
fs.writeFileSync(secPath, secContent, 'utf8');

console.log("Fixed TS unused variables that blocked Vite HMR");
