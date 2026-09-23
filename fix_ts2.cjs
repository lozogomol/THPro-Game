const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let rompContent = fs.readFileSync(rompPath, 'utf8');

rompContent = rompContent.replace(/const boardPixelSize = 270;\s*const tileSize = Math\.floor\(boardPixelSize \/ gridSize\);/, '');

fs.writeFileSync(rompPath, rompContent, 'utf8');
console.log("Fixed tileSize TS error");
