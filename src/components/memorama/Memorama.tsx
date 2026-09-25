/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import './Memorama.css';
import { soundManager } from '../../utils/audio';
import cartaImg from '../../assets/Carta.png';

import imgM1 from '../../assets/M-1.png';
import imgM2 from '../../assets/M-2.png';
import imgM3 from '../../assets/M-3.png';
import imgM4 from '../../assets/M-4.png';
import imgM5 from '../../assets/M-5.png';
import imgM6 from '../../assets/M-6.png';
import imgM7 from '../../assets/M-7.png';
import imgLogo from '../../assets/Logo.png';

export type DificultadMemorama = 'aprendiz' | 'talentoso' | 'maestro';

interface Carta {
  id: number;
  imgUrl: string;
  nombre: string;
  volteada: boolean;
  emparejada: boolean;
}

const IMAGENES_DISPONIBLES = [
  { imgUrl: imgM1, nombre: 'M-1' },
  { imgUrl: imgM2, nombre: 'M-2' },
  { imgUrl: imgM3, nombre: 'M-3' },
  { imgUrl: imgM4, nombre: 'M-4' },
  { imgUrl: imgM5, nombre: 'M-5' },
  { imgUrl: imgM6, nombre: 'M-6' },
  { imgUrl: imgM7, nombre: 'M-7' },
  { imgUrl: imgLogo, nombre: 'Logo' },
];

const CONFIGURACION_MEMORAMA = {
  aprendiz: { pares: 4, tiempo: 60 },
  talentoso: { pares: 6, tiempo: 40 },
  maestro: { pares: 8, tiempo: 40 }
};

const generarCartas = (parejasCount: number): Carta[] => {
  const seleccion = IMAGENES_DISPONIBLES.slice(0, parejasCount);
  const cartasDuplicadas: Carta[] = [];

  seleccion.forEach((item, index) => {
    cartasDuplicadas.push({ id: index * 2, imgUrl: item.imgUrl, nombre: item.nombre, volteada: false, emparejada: false });
    cartasDuplicadas.push({ id: index * 2 + 1, imgUrl: item.imgUrl, nombre: item.nombre, volteada: false, emparejada: false });
  });

  return cartasDuplicadas.sort(() => Math.random() - 0.5);
};

interface MemoramaProps {
  onVolver: () => void;
  onResultado: (victoria: boolean, premio: string) => void;
}

export default function Memorama({ onVolver, onResultado }: MemoramaProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('config');
  const [dificultad, setDificultad] = useState<DificultadMemorama>('talentoso');
  const [limiteTiempo, setLimiteTiempo] = useState<number>(120);

  const [cartas, setCartas] = useState<Carta[]>([]);
  const [cartasVolteadas, setCartasVolteadas] = useState<number[]>([]);
  const [cartasEncontradas, setCartasEncontradas] = useState<number[]>([]);

  const [movimientos, setMovimientos] = useState<number>(0);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);

  const [enJuego, setEnJuego] = useState<boolean>(false);
  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haPerdido, setHaPerdido] = useState<boolean>(false);
  const [bloqueo, setBloqueo] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  const getPremio = (dif: string) => {
    if (dif === 'facil' || dif === 'aprendiz') return '';
    if (dif === 'medio' || dif === 'talentoso') return 'Un Premio';
    if (dif === 'dificil' || dif === 'maestro') return 'Masaje Exprés';
    return '';
  };

  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && cartas.length === 0) {
      iniciarJuego(dificultad);
    }
  }, [pantalla]);

  function iniciarJuego(nivel: DificultadMemorama = dificultad) {
    soundManager.playClick();
    const config = CONFIGURACION_MEMORAMA[nivel];
    const mazoMezclado = generarCartas(config.pares);

    setCartas(mazoMezclado);
    setCartasVolteadas([]);
    setCartasEncontradas([]);
    setMovimientos(0);
    setTiempoSegundos(config.tiempo > 0 ? config.tiempo : 0);
    setHaGanado(false);
    setHaPerdido(false);
    setEnJuego(true);
    setBloqueo(false);
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
              onResultado(false, '');
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
  }, [enJuego, haGanado, haPerdido, limiteTiempo, onResultado]);

  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const manejarClickCarta = (index: number) => {
    if (!enJuego || bloqueo || haGanado || haPerdido) return;

    setCartasVolteadas((prevVolteadas) => {
      if (prevVolteadas.includes(index) || cartasEncontradas.includes(index)) return prevVolteadas;
      if (prevVolteadas.length >= 2) return prevVolteadas; // Prevent more than 2 flips

      soundManager.playClick();
      const nuevasVolteadas = [...prevVolteadas, index];

      if (nuevasVolteadas.length === 2) {
        setBloqueo(true);
        setMovimientos((m) => m + 1);

        const carta1 = cartas[nuevasVolteadas[0]];
        const carta2 = cartas[nuevasVolteadas[1]];

        if (carta1.imgUrl === carta2.imgUrl) {
          soundManager.playMatch();
          setTimeout(() => {
            setCartasEncontradas((prevEncontradas) => {
              const nuevasEncontradas = [...prevEncontradas, nuevasVolteadas[0], nuevasVolteadas[1]];
              if (nuevasEncontradas.length === cartas.length) {
                setHaGanado(true);
                setEnJuego(false);
                onResultado(true, getPremio(dificultad));
                soundManager.playVictory();
              }
              return nuevasEncontradas;
            });
            setCartasVolteadas([]);
            setBloqueo(false);
          }, 600);
        } else {
          soundManager.playError();
          setTimeout(() => {
            setCartasVolteadas([]);
            setBloqueo(false);
          }, 1000);
        }
      }

      return nuevasVolteadas;
    });
  };

  const handleSeleccionarNivel = (nivel: DificultadMemorama) => {
    const config = CONFIGURACION_MEMORAMA[nivel];
    setDificultad(nivel);
    setLimiteTiempo(config.tiempo);
    iniciarJuego(nivel);
  };

  if (pantalla === 'config') {
    return (
      <div className="memorama-wrapper config-screen" style={{ padding: '5mm' }}>
        <div className="config-box clean-modal-box">
          <h2 style={{ textAlign: 'center' }}>Nivel de Memorama<br />THPro S.R.L.</h2>
          <div className="config-section">
            <div className="difficulty-pill-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button className="btn-primary-action" onClick={() => handleSeleccionarNivel('aprendiz')}>Aprendiz</button>
              <button className="btn-primary-action" onClick={() => handleSeleccionarNivel('talentoso')}>Talentoso</button>
              <button className="btn-primary-action" onClick={() => handleSeleccionarNivel('maestro')}>Maestro</button>
            </div>
          </div>
          <div className="victory-btn-group" style={{ marginTop: '20px' }}>
              <button className="btn-secondary-action" onClick={onVolver}>Volver al Menú</button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="memorama-wrapper">
      
      <div className="memorama-content">
        <div className="memorama-board-card" style={{ position: 'relative' }}>
  

          
      <div className="metrics-strip">

            <div 
              className="metric-chip config-chip" 
              onClick={() => { setPantalla('config'); setEnJuego(false); }} 
              style={{ cursor: 'pointer', order: 99 }}
              title="Volver a Configuración"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
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
            
          </div>
          <div className={`cartas-grid grid-${dificultad}`}>
            {cartas.map((carta, index) => {
              const estaVolteada = cartasVolteadas.includes(index);
              const estaEncontrada = cartasEncontradas.includes(index);
              return (
                <div 
                  key={carta.id} 
                  className={`memorama-card ${estaVolteada ? 'flipped' : ''} ${estaEncontrada ? 'matched' : ''}`}
                  onClick={() => manejarClickCarta(index)}
                >
                  <div className="card-inner">
      

                    <div className="card-back" style={{ padding: 0 }}>
                      <img src={cartaImg} alt="Carta" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    </div>
                    <div className="card-front" style={{ padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={carta.imgUrl} 
                        alt={carta.nombre} 
                        style={{ 
                          width: ['M-1', 'M-2', 'M-3'].includes(carta.nombre) ? '80%' : '100%', 
                          height: ['M-1', 'M-2', 'M-3'].includes(carta.nombre) ? '80%' : '100%', 
                          objectFit: 'contain' 
                        }} 
                        draggable={false} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "10px 0" }}>{getPremio(dificultad) === '' ? '¡Ganaste!' : `¡Ganaste ${getPremio(dificultad)}!`}</h2>
            <div className="victory-summary-stats">
              <div className="summary-col">
                <span className="sum-label">Movimientos</span>
                <span className="sum-value">{movimientos}</span>
              </div>
              <div className="summary-col">
                <span className="sum-label">Tiempo</span>
                <span className="sum-value">{limiteTiempo > 0 ? formatoTiempo(limiteTiempo - tiempoSegundos) : formatoTiempo(tiempoSegundos)}</span>
              </div>
            </div>
            <div className="victory-btn-group">
              <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>
            </div>
          </div>
        </div>
      )}

      {haPerdido && (
        <div className="clean-modal-backdrop victory-backdrop">
            <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
              <h2 style={{ textAlign: "center", margin: "15px 0 25px" }}>¡Perdiste!</h2>
              <div className="victory-btn-group">
                <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
