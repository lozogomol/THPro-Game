const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

// replace gap: '20px' with gap: '5mm' in config-screen
content = content.replace(/gap:\s*'20px'/g, "gap: '5mm'");

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Fixed gap to 5mm in Rompecabezas");
