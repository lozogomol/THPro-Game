import { useState } from 'react';
import './App.css';
import logoImg from './assets/Logo.png';
import MenuPrincipal from './components/menu/MenuPrincipal';
import Rompecabezas from './components/rompecabezas/Rompecabezas';
import Memorama from './components/memorama/Memorama';
import Reflejos from './components/reflejos/Reflejos';
import Secuencia from './components/secuencia/Secuencia';

export type JuegoId = 'rompecabezas' | 'memorama' | 'reflejos' | 'secuencia' | null;

const JUEGOS_INFO: Record<string, { titulo: string; tema: 'celeste' | 'rosa' }> = {
  rompecabezas: { titulo: 'Rompecabezas Visual', tema: 'celeste' },
  memorama: { titulo: 'Memorama de Parejas', tema: 'rosa' },
  reflejos: { titulo: 'Reflejos y Puntería', tema: 'celeste' },
  secuencia: { titulo: 'Secuencia Mental', tema: 'rosa' },
};

export default function App() {
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<JuegoId>(null);

  const handleSeleccionarJuego = (id: string) => {
    if (id === 'rompecabezas' || id === 'memorama' || id === 'reflejos' || id === 'secuencia') {
      setJuegoSeleccionado(id);
    }
  };

  const handleVolverAlMenu = () => {
    setJuegoSeleccionado(null);
  };

  return (
    <div className="clean-app-container">
      {/* Navegación con logo THPro y título */}
      <header className="clean-navbar">
        {!juegoSeleccionado ? (
          <div 
            className="clean-brand" 
            onClick={handleVolverAlMenu}
            title="Ir al inicio"
          >
            <img src={logoImg} alt="Logo THPro" className="brand-logo-img" />
            <span className="brand-title">Minijuegos THPro</span>
          </div>
        ) : (
          <div className="navbar-game-area" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div style={{ flex: '0 0 160px' }}></div> {/* Spacer para centrar */}
            
            <div className={`navbar-game-pill tema-${JUEGOS_INFO[juegoSeleccionado]?.tema || 'celeste'}`} style={{ margin: '0 auto' }}>
              <span className="navbar-game-title" style={{ fontSize: '1.2rem', padding: '0 10px' }}>{JUEGOS_INFO[juegoSeleccionado]?.titulo}</span>
            </div>

            <button className="btn-nav-volver" onClick={handleVolverAlMenu} style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}>
              MENÚ PRINCIPAL
            </button>
          </div>
        )}
      </header>

      {/* Renderizado del juego seleccionado o menú */}
      <main className="clean-main-content">
        {juegoSeleccionado === 'rompecabezas' && (
          <Rompecabezas onVolver={handleVolverAlMenu} />
        )}

        {juegoSeleccionado === 'memorama' && (
          <Memorama onVolver={handleVolverAlMenu} />
        )}

        {juegoSeleccionado === 'reflejos' && (
          <Reflejos onVolver={handleVolverAlMenu} />
        )}

        {juegoSeleccionado === 'secuencia' && (
          <Secuencia onVolver={handleVolverAlMenu} />
        )}

        {!juegoSeleccionado && (
          <MenuPrincipal onSeleccionarJuego={handleSeleccionarJuego} />
        )}
      </main>
    </div>
  );
}
