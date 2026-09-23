const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

// Replace puzzle-grid-frame inline style
const frameRegex = /style=\{\{\s*width: `\$\{gridSize \* tileSize \+ \(gridSize - 1\) \* 4\}px`,\s*gridTemplateColumns: `repeat\(\$\{gridSize\}, \$\{tileSize\}px\)`,\s*gridTemplateRows: `repeat\(\$\{gridSize\}, \$\{tileSize\}px\)`\s*\}\}/;

content = content.replace(frameRegex, `style={{
                width: '100%',
                maxWidth: 'min(90vw, 55vh, 400px)',
                aspectRatio: '1 / 1',
                gridTemplateColumns: \`repeat(\${gridSize}, 1fr)\`,
                gridTemplateRows: \`repeat(\${gridSize}, 1fr)\`
              }}`);

// Replace puzzle-piece inline style
const pieceRegex = /style=\{\{\s*width: `\$\{tileSize\}px`,\s*height: `\$\{tileSize\}px`,\s*backgroundImage: `url\(\$\{imagenActual\.url\}\)`,\s*backgroundSize: `\$\{gridSize \* 100\}% \$\{gridSize \* 100\}%`,\s*backgroundPosition: `\$\{posX\}% \$\{posY\}%`\s*\}\}/;

content = content.replace(pieceRegex, `style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: \`url(\${imagenActual.url})\`,
                    backgroundSize: \`\${gridSize * 100}% \${gridSize * 100}%\`,
                    backgroundPosition: \`\${posX}% \${posY}%\`
                  }}`);

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Made Rompecabezas fully responsive");
