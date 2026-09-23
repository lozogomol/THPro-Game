const fs = require('fs');
const path = require('path');

const cssPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.css';
let content = fs.readFileSync(cssPath, 'utf8');

content = content.replace(/\.config-screen-layout\s*\{[\s\S]*?align-items:\s*stretch;\s*\}/, match => {
  return match.replace(/gap:\s*16px;/, 'gap: 5mm;\n  padding: 5mm;\n  box-sizing: border-box;');
});

fs.writeFileSync(cssPath, content, 'utf8');
console.log("Fixed Rompecabezas config screen padding and gap");
