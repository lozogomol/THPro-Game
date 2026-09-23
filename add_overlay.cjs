const fs = require('fs');
const path = require('path');

const rompPath = 'C:/THPro-Game/THPro-Game/src/components/rompecabezas/Rompecabezas.tsx';
let content = fs.readFileSync(rompPath, 'utf8');

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
  content = content.replace(/(<\/div>\s*\);\s*\};\s*export default Rompecabezas;)/, overlay + '\n$1');
  fs.writeFileSync(rompPath, content, 'utf8');
  console.log("Added overlay");
} else {
  console.log("Overlay already exists");
}
