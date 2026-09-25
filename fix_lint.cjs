const fs = require('fs');
const path = require('path');

function fixFile(filePath, isSecuencia = false) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Remove icons
  content = content.replace(/<div className="victory-icon-bubble".*?<\/div>\s*/g, '');

  // Move iniciarJuego before useEffects that use it
  // This is tricky with regex, we can just find const iniciarJuego and the useEffect
  // A simpler way is to just let the script do it via a simple regex.
  // Actually, we can just replace `const iniciarJuego = ` with `function iniciarJuego(...) { ... }` 
  // because function declarations are hoisted!
  // Reflejos: const iniciarJuego = useCallback(() => { ...
  if (content.includes('const iniciarJuego = useCallback(() => {')) {
    content = content.replace('const iniciarJuego = useCallback(() => {', 'const iniciarJuego = useCallback(function iniciarJuego() {');
  } else {
    // Memorama, Secuencia, Rompecabezas
    content = content.replace(/const iniciarJuego = \((.*?)\) => {/g, 'function iniciarJuego($1) {');
  }

  // Reflejos unused vars
  if (filePath.includes('Reflejos')) {
    content = content.replace(/const \[racha, setRacha\] = useState<number>\(0\);\n/g, '');
    content = content.replace(/const \[rachaMax, setRachaMax\] = useState<number>\(0\);\n/g, '');
    // Remove their setters
    content = content.replace(/setRacha\(0\);\n/g, '');
    content = content.replace(/setRachaMax\(0\);\n/g, '');
    content = content.replace(/setRacha\(\(prevRacha\) => \{[\s\S]*?return nuevaRacha;\n\s*\}\);\n/g, '');
  }

  // Secuencia unused vars
  if (filePath.includes('Secuencia')) {
    content = content.replace(/const \[pasoUsuario, setPasoUsuario\] = useState<number>\(0\);\n/g, '');
    content = content.replace(/setPasoUsuario\(0\);\n/g, '');
    // Wait, pasoUsuario was removed from state but I still need it or did I remove it?
    // I changed setPasoUsuario to use prevPaso, so it MUST exist!
    // Ah! I accidentally removed the usage of `pasoUsuario` in the render but still have the state.
    // The linter says: 'pasoUsuario' is assigned a value but never used.
    // That means I should keep it but just ignore the warning or remove it if not needed.
    // I do need it for state! But since I only use `prevPaso` inside the setter, the value itself is not read in the render!
    // So `const [, setPasoUsuario] = useState<number>(0);`
    content = content.replace(/const \[pasoUsuario, setPasoUsuario\]/g, 'const [, setPasoUsuario]');
  }

  // App.tsx any
  if (filePath.includes('App.tsx')) {
    content = content.replace(/\(j: any\)/g, '(j: { id: string; resultado: string; premio: string })');
  }

  // main.tsx
  if (filePath.includes('main.tsx')) {
    content = content.replace(/import \{ StrictMode \} from 'react'\n/g, '');
  }

  fs.writeFileSync(filePath, content);
  console.log('Fixed', filePath);
}

const componentsDir = 'C:\\THPro-Game\\THPro-Game\\src\\components';
const filesToFix = [
  path.join(componentsDir, 'reflejos', 'Reflejos.tsx'),
  path.join(componentsDir, 'memorama', 'Memorama.tsx'),
  path.join(componentsDir, 'secuencia', 'Secuencia.tsx'),
  path.join(componentsDir, 'rompecabezas', 'Rompecabezas.tsx'),
  'C:\\THPro-Game\\THPro-Game\\src\\App.tsx',
  'C:\\THPro-Game\\THPro-Game\\src\\main.tsx',
  'C:\\THPro-Game\\THPro-Game\\src\\components\\registro\\PanelAdmin.tsx'
];

filesToFix.forEach(f => {
  if (fs.existsSync(f)) {
    fixFile(f, f.includes('Secuencia'));
  }
});
