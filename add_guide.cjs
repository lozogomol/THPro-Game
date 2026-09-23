const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

// 1. Add state
if (!content.includes('const [mostrarGuia, setMostrarGuia]')) {
  content = content.replace(/const \[haPerdidoTiempo, setHaPerdidoTiempo\] = useState<boolean>\(false\);/, 
    `const [haPerdidoTiempo, setHaPerdidoTiempo] = useState<boolean>(false);\n  const [mostrarGuia, setMostrarGuia] = useState<boolean>(false);`);
}

// 2. Add guide button right before the gear button
const gearChipRegex = /(<div\s+className="metric-chip config-chip"\s+onClick=\{\(\) => \{\s*setPantalla\('config'\);\s*setEnJuego\(false\);\s*\}\}[\s\S]*?<\/svg>\s*<\/div>)/;
const guideChip = `
            <div 
              className="metric-chip config-chip" 
              onClick={() => setMostrarGuia(true)} 
              style={{ cursor: 'pointer', order: 98 }}
              title="Ver Imagen Guía"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
`;
if (!content.includes('Ver Imagen Guía')) {
  content = content.replace(gearChipRegex, guideChip + '$1');
}

// 3. Add overlay
const overlay = `
      {mostrarGuia && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setMostrarGuia(false)}>
          <span style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '2rem', cursor: 'pointer', fontWeight: 'bold' }}>&times;</span>
          <img src={imagenActual.url} alt="Guía" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }} />
          <p style={{ color: '#fff', marginTop: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Toca para cerrar</p>
        </div>
      )}
`;
if (!content.includes('Toca para cerrar')) {
  content = content.replace(/(<\/div>\s*)$/, overlay + '\n$1');
}

fs.writeFileSync(rompPath, content, 'utf8');
console.log("Added guide button and overlay");
