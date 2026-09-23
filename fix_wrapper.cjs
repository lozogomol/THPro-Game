const fs = require('fs');
const path = require('path');

const games = [
  { path: 'rompecabezas/Rompecabezas.tsx', wrapper: 'rompecabezas-wrapper' },
  { path: 'memorama/Memorama.tsx', wrapper: 'memorama-wrapper' },
  { path: 'reflejos/Reflejos.tsx', wrapper: 'reflejos-wrapper' },
  { path: 'secuencia/Secuencia.tsx', wrapper: 'secuencia-wrapper' }
];

const basePath = 'C:/THPro-Game/THPro-Game/src/components';

games.forEach(game => {
  const filePath = path.join(basePath, game.path);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove literal \n
  content = content.replace(/\\n\s*<button/g, '\n      <button');
  
  // Find the exact main wrapper in the last return and add style
  const parts = content.split('return (');
  if (parts.length > 1) {
    const lastReturnIndex = parts.length - 1;
    let mainReturn = parts[lastReturnIndex];
    
    // Replace <div className="game-wrapper"> with <div className="game-wrapper" style={{ position: 'relative', width: '100%', minHeight: '100%' }}>
    // If it already has a style, we could inject into it, but these wrappers usually don't have style.
    const wrapperMatch = new RegExp('<div className="' + game.wrapper + '">');
    if (wrapperMatch.test(mainReturn)) {
      mainReturn = mainReturn.replace(wrapperMatch, '<div className="' + game.wrapper + '" style={{ position: "relative", width: "100%", minHeight: "100%" }}>');
    }
    
    parts[lastReturnIndex] = mainReturn;
    content = parts.join('return (');
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Fixed literal \\n and applied styles");
