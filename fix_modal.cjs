const fs = require('fs');
const path = require('path');
const file = 'C:/THPro-Game/THPro-Game/src/components/secuencia/Secuencia.tsx';

let content = fs.readFileSync(file, 'utf8');

const regex = /\{haFallado && !haGanado && !haPerdidoTiempo && \([\s\S]*?<\/div>\s*\)\}/;

const newModal = `{haFallado && !haGanado && !haPerdidoTiempo && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
            <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>!</div>
            <h2>¡Has Perdido!</h2>
            <p>Has alcanzado el límite de fallos permitidos.</p>
            <div className="victory-btn-group">
              <button className="btn-primary-action" onClick={() => iniciarJuego(limiteTiempo)}>Reintentar</button>
              <button className="btn-secondary-action" onClick={() => setPantalla('config')}>Volver a Configurar</button>
            </div>
          </div>
        </div>
      )}`;

content = content.replace(regex, newModal);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed overlay");
