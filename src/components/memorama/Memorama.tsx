import { useState, useEffect, useRef } from 'react';
import './Memorama.css';
import { soundManager } from '../../utils/audio';
import cartaImg from '../../assets/Carta.png';

export type DificultadMemorama = 'facil' | 'medio' | 'dificil';
export type TiempoLimite = 180 | 300;

interface Carta {
  id: number;
  simbolo: string;
  nombre: string;
  volteada: boolean;
  emparejada: boolean;
}

const ICONOS_DISPONIBLES = [
  { simbolo: '✨', nombre: 'Destello' },
  { simbolo: '🚀', nombre: 'Cohete' },
  { simbolo: '🎨', nombre: 'Paleta' },
  { simbolo: '🌈', nombre: 'Arcoíris' },
  { simbolo: '💎', nombre: 'Diamante' },
  { simbolo: '🦄', nombre: 'Unicornio' },
  { simbolo: '🎈', nombre: 'Globo' },
  { simbolo: '🍕', nombre: 'Pizza' },
];

const generarCartas = (parejasCount: number): Carta[] => {
  const seleccion = ICONOS_DISPONIBLES.slice(0, parejasCount);
  const cartasDuplicadas: Carta[] = [];

  seleccion.forEach((item, index) => {
    cartasDuplicadas.push({ id: index * 2, simbolo: item.simbolo, nombre: item.nombre, volteada: false, emparejada: false });
    cartasDuplicadas.push({ id: index * 2 + 1, simbolo: item.simbolo, nombre: item.nombre, volteada: false, emparejada: false });
  });

  return cartasDuplicadas.sort(() => Math.random() - 0.5);
};

interface MemoramaProps {
  onVolver: () => void;
}

export default function Memorama({ onVolver }: MemoramaProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('juego');
  const [dificultad, setDificultad] = useState<DificultadMemorama>('dificil');
  const [limiteTiempo, setLimiteTiempo] = useState<TiempoLimite>(300);

  const numParejas = dificultad === 'facil' ? 4 : dificultad === 'medio' ? 6 : 8;

  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cartasVolteadas, setCartasVolteadas] = useState<number[]>([]);
  const [bloquearTablero, setBloquearTablero] = useState<boolean>(false);

  const [movimientos, setMovimientos] = useState<number>(0);
  const [parejasEncontradas, setParejasEncontradas] = useState<number>(0);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);
  const [enJuego, setEnJuego] = useState<boolean>(false);
  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haPerdido, setHaPerdido] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Use an effect to auto-start on load because it starts in 'juego' mode
  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && cartas.length === 0) {
      iniciarJuego();
    }
  }, [pantalla]);

  const iniciarJuego = () => {
    soundManager.playClick();
    setCartas(generarCartas(numParejas));
    setCartasVolteadas([]);
    setBloquearTablero(false);
    setMovimientos(0);
    setParejasEncontradas(0);
    setTiempoSegundos(limiteTiempo > 0 ? limiteTiempo : 0);
    setHaGanado(false);
    setHaPerdido(false);
    setEnJuego(true);
    setPantalla('juego');
  };

  useEffect(() => {
    if (enJuego && !haGanado && !haPerdido) {
      timerRef.current = window.setInterval(() => {
        setTiempoSegundos((prev) => {
          if (limiteTiempo > 0) {
            if (prev <= 1) {
              setHaPerdido(true);
              setEnJuego(false);
              if (timerRef.current) clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [enJuego, haGanado, haPerdido, limiteTiempo]);

  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleCartaClick = (id: number) => {
    if (bloquearTablero || haGanado || haPerdido) return;

    const carta = cartas.find((c) => c.id === id);
    if (!carta || carta.volteada || carta.emparejada) return;

    soundManager.playClick();
    const nuevasCartas = cartas.map((c) => (c.id === id ? { ...c, volteada: true } : c));
    setCartas(nuevasCartas);
    const nuevoArrayVolteadas = [...cartasVolteadas, id];
    setCartasVolteadas(nuevoArrayVolteadas);

    if (nuevoArrayVolteadas.length === 2) {
      setBloquearTablero(true);
      setMovimientos((prev) => prev + 1);

      const [id1, id2] = nuevoArrayVolteadas;
      const carta1 = cartas.find((c) => c.id === id1);
      const carta2 = cartas.find((c) => c.id === id2);

      if (carta1 && carta2 && carta1.simbolo === carta2.simbolo) {
        soundManager.playSwap();
        setTimeout(() => {
          setCartas((prev) => prev.map((c) => (c.id === id1 || c.id === id2 ? { ...c, emparejada: true } : c)));
          setCartasVolteadas([]);
          setBloquearTablero(false);
          const nuevasParejas = parejasEncontradas + 1;
          setParejasEncontradas(nuevasParejas);
          if (nuevasParejas === numParejas) {
            setHaGanado(true);
            setEnJuego(false);
            soundManager.playVictory();
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCartas((prev) => prev.map((c) => (c.id === id1 || c.id === id2 ? { ...c, volteada: false } : c)));
          setCartasVolteadas([]);
          setBloquearTablero(false);
        }, 900);
      }
    }
  };

  if (pantalla === 'config') {
    return (
      <div className="memorama-wrapper config-screen">
        <div className="config-box clean-modal-box">
          <h2>Configuración del Memorama</h2>
          
          <div className="config-section">
            <label>Dificultad:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${dificultad === 'facil' ? 'active' : ''}`} onClick={() => setDificultad('facil')}>Fácil (8)</button>
              <button className={`diff-btn ${dificultad === 'medio' ? 'active' : ''}`} onClick={() => setDificultad('medio')}>Medio (12)</button>
              <button className={`diff-btn ${dificultad === 'dificil' ? 'active' : ''}`} onClick={() => setDificultad('dificil')}>Difícil (16)</button>
            </div>
          </div>

          <div className="config-section">
            <label>Tiempo Límite:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${limiteTiempo === 180 ? 'active' : ''}`} onClick={() => setLimiteTiempo(180)}>3 Minutos</button>
              <button className={`diff-btn ${limiteTiempo === 300 ? 'active' : ''}`} onClick={() => setLimiteTiempo(300)}>5 Minutos</button>
            </div>
          </div>

          <div className="victory-btn-group" style={{ marginTop: '30px' }}>
            <button className="btn-primary-action" onClick={iniciarJuego}>¡Jugar!</button>
            <button className="btn-secondary-action" onClick={onVolver}>Volver al Menú</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="memorama-wrapper">
      <div className="memorama-content">
        <div className="memorama-board-card">
          <div className="metrics-strip">
            <div className="metric-chip">
              <span className="metric-label">Parejas</span>
              <span className="metric-val">{parejasEncontradas} / {numParejas}</span>
            </div>
            <div className="metric-chip">
              <span className="metric-label">Movimientos</span>
              <span className="metric-val">{movimientos}</span>
            </div>
            <div className="metric-chip">
              <span className="metric-label">{limiteTiempo > 0 ? 'Tiempo Restante' : 'Tiempo'}</span>
              <span className={`metric-val ${limiteTiempo > 0 && tiempoSegundos <= 10 ? 'time-warning' : ''}`}>
                {formatoTiempo(tiempoSegundos)}
              </span>
            </div>
            <button className="btn-secondary-action reset-btn" onClick={() => setPantalla('config')}>Configurar</button>
          </div>

          <div className={`cartas-grid grid-${dificultad}`}>
            {cartas.map((carta) => {
              const estaDescubierta = carta.volteada || carta.emparejada;
              return (
                <div key={carta.id} className={`memorama-card ${estaDescubierta ? 'flipped' : ''} ${carta.emparejada ? 'matched' : ''}`} onClick={() => handleCartaClick(carta.id)}>
                  <div className="card-inner">
                    <div className="card-back" style={{ backgroundImage: `url(${cartaImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    </div>
                    <div className="card-front">
                      <span className="card-symbol">{carta.simbolo}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mouse-hint">Haz clic sobre dos cartas para encontrar las parejas idénticas.</p>
        </div>
      </div>

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <div className="victory-icon-bubble">¡OK!</div>
            <h2>¡Excelente Memoria!</h2>
            <p>Has completado el juego en dificultad <strong>{dificultad.toUpperCase()}</strong>.</p>
            <div className="victory-summary-stats">
              <div className="summary-col">
                <span className="sum-label">Movimientos</span>
                <span className="sum-value">{movimientos}</span>
              </div>
              <div className="summary-col">
                <span className="sum-label">Tiempo Total</span>
                <span className="sum-value">{limiteTiempo > 0 ? formatoTiempo(limiteTiempo - tiempoSegundos) : formatoTiempo(tiempoSegundos)}</span>
              </div>
            </div>
            <div className="victory-btn-group">
              <button className="btn-primary-action" onClick={iniciarJuego}>Jugar de Nuevo</button>
              <button className="btn-secondary-action" onClick={() => setPantalla('config')}>Volver a Configurar</button>
            </div>
          </div>
        </div>
      )}

      {haPerdido && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
            <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>!</div>
            <h2>¡Se acabó el tiempo!</h2>
            <p>No lograste encontrar todas las parejas a tiempo.</p>
            <div className="victory-btn-group">
              <button className="btn-primary-action" onClick={iniciarJuego}>Reintentar</button>
              <button className="btn-secondary-action" onClick={() => setPantalla('config')}>Volver a Configurar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
