const fs = require('fs');
const path = require('path');

const cssPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.css';
let content = fs.readFileSync(cssPath, 'utf8');

content = content.replace(/\.puzzle-grid-frame\s*\{[\s\S]*?box-shadow:\s*inset[^;]+;/, `.puzzle-grid-frame {
  display: grid;
  gap: 4px;
  background: transparent;
  padding: 0;
  border-radius: 12px;
  border: none;
  box-shadow: none;`);

fs.writeFileSync(cssPath, content, 'utf8');
console.log("Fixed puzzle grid background");
