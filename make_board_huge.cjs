const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

content = content.replace(/maxWidth:\s*'min\(100%, 75vh, 650px\)'/g, "maxWidth: 'min(100%, 80vh, 800px)'");

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Made Rompecabezas board even larger");
