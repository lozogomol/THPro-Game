const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

content = content.replace(/height:\s*'340px',\s*minHeight:\s*'340px',\s*/g, "");
content = content.replace(/minHeight:\s*'340px',\s*/g, "");

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Removed fixed heights from Rompecabezas config boxes");
