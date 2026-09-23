const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

// Replace flex: '0 1 320px', width: '320px' with width: '100%', maxWidth: '350px'
content = content.replace(/style=\{\{\s*flex:\s*'0 1 320px',\s*width:\s*'320px'/g, "style={{ width: '100%', maxWidth: '350px'");

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Fixed Rompecabezas config box widths");
