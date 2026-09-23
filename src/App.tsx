import { useState } from 'react';
import './App.css';
import logoImg from './assets/Logo.png';
import MenuPrincipal from './components/menu/MenuPrincipal';
import Rompecabezas from './components/rompecabezas/Rompecabezas';
import Memorama from './components/memorama/Memorama';
import Reflejos from './components/reflejos/Reflejos';
import Secuencia from './components/secuencia/Secuencia';
import RegistroJugador from './components/registro/RegistroJugador';
import PanelAdmin from './components/registro/PanelAdmin';

export type JuegoId = 'rompecabezas' | 'memorama' | 'reflejos' | 'secuencia' | null;

const JUEGOS_INFO: Record<string, { titulo: string; tema: 'celeste' | 'rosa' }> = {
  rompecabezas: { titulo: 'Rompecabeza THPro S.R.L.', tema: 'celeste' },
  memorama: { titulo: 'Memorama THPro S.R.L.', tema: 'rosa' },
  reflejos: { titulo: 'Reflejos THPro S.R.L.', tema: 'celeste' },
  secuencia: { titulo: 'Secuencia THPro S.R.L.', tema: 'rosa' },
};

export default function App() {
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<JuegoId>(null);
  const [juegoPendiente, setJuegoPendiente] = useState<JuegoId>(null);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);
  const [jugadorActivoId, setJugadorActivoId] = useState<string | null>(null);

  const handleSeleccionarJuego = (id: string) => {
    if (id === 'rompecabezas' || id === 'memorama' || id === 'reflejos' || id === 'secuencia') {
      setJuegoPendiente(id as JuegoId);
    }
  };

  const guardarYJugar = (datos: { nombre: string; apellido: string; telefono: string }) => {
    if (juegoPendiente) {
      const newId = crypto.randomUUID();
      const nuevoRegistro = {
        id: newId,
        ...datos,
        juego: juegoPendiente,
        fecha: new Date().toISOString(),
        resultado: 'Pendiente',
        premio: '-'
      };
      
      const guardados = localStorage.getItem('thpro_jugadores');
      const lista = guardados ? JSON.parse(guardados) : [];
      lista.push(nuevoRegistro);
      localStorage.setItem('thpro_jugadores', JSON.stringify(lista));

      setJugadorActivoId(newId);
      setJuegoSeleccionado(juegoPendiente);
      setJuegoPendiente(null);
    }
  };

  const handleResultado = (victoria: boolean, premio: string) => {
    if (!jugadorActivoId) return;
    const guardados = localStorage.getItem('thpro_jugadores');
    if (guardados) {
      const lista = JSON.parse(guardados);
      const idx = lista.findIndex((j: any) => j.id === jugadorActivoId);
      if (idx !== -1) {
        lista[idx].resultado = victoria ? 'Ganó' : 'Perdió';
        lista[idx].premio = victoria ? premio : '-';
        localStorage.setItem('thpro_jugadores', JSON.stringify(lista));
      }
    }
  };

  const handleVolverAlMenu = () => {
    if (juegoSeleccionado) {
      if (!window.confirm('¿Estás seguro de salir? Si estás jugando perderás tu progreso.')) {
        return;
      }
    }
    setJuegoSeleccionado(null);
    setJugadorActivoId(null);
  };
  
  const forzarVolverAlMenu = () => {
    setJuegoSeleccionado(null);
    setJugadorActivoId(null);
  };

  const handleLogoDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pwd = window.prompt('Ingrese la contraseña de administrador:');
    if (pwd === 'THPro') {
      setMostrarAdmin(true);
    } else if (pwd !== null) {
      alert('Contraseña incorrecta.');
    }
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
            <img 
              src={logoImg} 
              alt="Logo THPro" 
              className="brand-logo-img" 
              onDoubleClick={handleLogoDoubleClick}
            />
            <span className="brand-title">Minijuegos THPro S.R.L.</span>
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
          <Rompecabezas onVolver={forzarVolverAlMenu} onResultado={handleResultado} />
        )}

        {juegoSeleccionado === 'memorama' && (
          <Memorama onVolver={forzarVolverAlMenu} onResultado={handleResultado} />
        )}

        {juegoSeleccionado === 'reflejos' && (
          <Reflejos onVolver={forzarVolverAlMenu} onResultado={handleResultado} />
        )}

        {juegoSeleccionado === 'secuencia' && (
          <Secuencia onVolver={forzarVolverAlMenu} onResultado={handleResultado} />
        )}

        {!juegoSeleccionado && (
          <MenuPrincipal onSeleccionarJuego={handleSeleccionarJuego} />
        )}
      </main>

      {/* Modales Globales */}
      {juegoPendiente && (
        <RegistroJugador 
          onSubmit={guardarYJugar} 
          onCancelar={() => setJuegoPendiente(null)} 
        />
      )}

      {mostrarAdmin && (
        <PanelAdmin onCerrar={() => setMostrarAdmin(false)} />
      )}
    </div>
  );
}
