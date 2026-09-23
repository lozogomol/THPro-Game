const fs = require('fs');
const path = require('path');

const refPath = 'C:/THPro-Game/THPro-Game/src/components/reflejos/Reflejos.tsx';
let content = fs.readFileSync(refPath, 'utf8');

// 1. Change handleArenaClick binding
content = content.replace(/onMouseDown=\{handleArenaClick\}/, 'onPointerDown={handleArenaClick}');

// 2. Change handleClickObjetivo binding
content = content.replace(/onMouseDown=\{\(e\) => handleClickObjetivo\(e, objetivoActual\.id\)\}\s*onTouchStart=\{\(e\) => handleClickObjetivo\(e, objetivoActual\.id\)\}/, 
  'onPointerDown={(e) => handleClickObjetivo(e as any, objetivoActual.id)}');

// 3. Add e.preventDefault() to handleClickObjetivo to stop touch ghost clicks
content = content.replace(/const handleClickObjetivo = \([\s\S]*?=>\s*\{/, match => {
  return match + '\n    e.preventDefault();';
});

fs.writeFileSync(refPath, content, 'utf8');
console.log("Fixed Reflejos click events");
