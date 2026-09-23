const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

content = content.replace(/const \[limiteTiempo, setLimiteTiempo\] = useState<TiempoLimite>\(300\);/g, 'const [limiteTiempo, setLimiteTiempo] = useState<TiempoLimite>(80);');

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Fixed Rompecabezas default limiteTiempo");
