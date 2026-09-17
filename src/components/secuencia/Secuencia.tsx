import { useState, useEffect, useRef } from 'react';
import './Secuencia.css';
import { soundManager } from '../../utils/audio';

import esteticaFacialImg from '../../assets/Estetica_Facial.png';
import esteticaCorporalImg from '../../assets/Estetica_Corporal.png';
import fisioterapiaImg from '../../assets/Fisioterapia.png';
import gimnasiaLaboralImg from '../../assets/Gimnasia_Laboral.png';

export type DificultadSecuencia = 'facil' | 'medio' | 'dificil';
export type TiempoLimite = 180 | 300;

interface Pad {
  id: number;
  nombre: string;
  colorClase: string;
  imagen: string;
}

const PADS: Pad[] = [
  { id: 0, nombre: 'Estética Facial', colorClase: 'pad-celeste', imagen: esteticaFacialImg },
  { id: 1, nombre: 'Estética Corporal', colorClase: 'pad-rosa', imagen: esteticaCorporalImg },
  { id: 2, nombre: 'Fisioterapia', colorClase: 'pad-celeste', imagen: fisioterapiaImg },
  { id: 3, nombre: 'Gimnasia Laboral', colorClase: 'pad-rosa', imagen: gimnasiaLaboralImg }
];

interface SecuenciaProps {
  onVolver: () => void;
}

export default function Secuencia({ onVolver }: SecuenciaProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('juego');
  const [dificultad, setDificultad] = useState<DificultadSecuencia>('dificil');
  const [limiteTiempo, setLimiteTiempo] = useState<TiempoLimite>(300);

  const config = {
    facil: { metaRondas: 5, intervaloMs: 650 },
    medio: { metaRondas: 8, intervaloMs: 500 },
    dificil: { metaRondas: 12, intervaloMs: 380 }
  }[dificultad];

  const [secuencia, setSecuencia] = useState<number[]>([]);
  const [pasoUsuario, setPasoUsuario] = useState<number>(0);
  const [padActivo, setPadActivo] = useState<number | null>(null);
  const [turnoJugador, setTurnoJugador] = useState<boolean>(false);
  const [rondaActual, setRondaActual] = useState<number>(1);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);

  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haFallado, setHaFallado] = useState<boolean>(false);
  const [haPerdidoTiempo, setHaPerdidoTiempo] = useState<boolean>(false);
  const [enJuego, setEnJuego] = useState<boolean>(false);

  const timeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const reproducirSecuencia = (sec: number[]) => {
    setTurnoJugador(false);
    setPasoUsuario(0);
    sec.forEach((padIndex, i) => {
      setTimeout(() => {
        setPadActivo(padIndex);
        soundManager.playSwap();
        setTimeout(() => {
          setPadActivo(null);
          if (i === sec.length - 1) {
            setTimeout(() => {
              setTurnoJugador(true);
            }, 250);
          }
        }, config.intervaloMs * 0.7);
      }, (i + 1) * config.intervaloMs);
    });
  };

  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && secuencia.length === 0) {
      iniciarJuego();
    }
  }, [pantalla]);

  const iniciarJuego = () => {
    soundManager.playClick();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setHaGanado(false);
    setHaFallado(false);
    setHaPerdidoTiempo(false);
    setPasoUsuario(0);
    setTurnoJugador(false);
    setRondaActual(1);
    setTiempoSegundos(limiteTiempo > 0 ? limiteTiempo : 0);
    setEnJuego(true);
    setPantalla('juego');

    const primerPaso = Math.floor(Math.random() * 4);
    const nuevaSecuencia = [primerPaso];
    setSecuencia(nuevaSecuencia);
    setTimeout(() => {
      reproducirSecuencia(nuevaSecuencia);
    }, 500);
  };

  const reintentarRonda = () => {
    soundManager.playClick();
    setHaFallado(false);
    setTurnoJugador(false);
    setPasoUsuario(0);
    setEnJuego(true);
    setTimeout(() => {
      reproducirSecuencia(secuencia);
    }, 500);
  };

  useEffect(() => {
    if ((enJuego || haFallado) && !haGanado && !haPerdidoTiempo) {
      timerRef.current = window.setInterval(() => {
        setTiempoSegundos((prev) => {
          if (limiteTiempo > 0) {
            if (prev <= 1) {
              setHaPerdidoTiempo(true);
              setEnJuego(false);
              setTurnoJugador(false);
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
  }, [enJuego, haFallado, haGanado, haPerdidoTiempo, limiteTiempo]);

  const handlePadClick = (id: number) => {
    if (!turnoJugador || haGanado || haFallado || haPerdidoTiempo) return;

    setPadActivo(id);
    soundManager.playClick();
    setTimeout(() => setPadActivo(null), 200);

    if (id === secuencia[pasoUsuario]) {
      const siguientePaso = pasoUsuario + 1;
      setPasoUsuario(siguientePaso);
      if (siguientePaso === secuencia.length) {
        if (secuencia.length >= config.metaRondas) {
          setHaGanado(true);
          setTurnoJugador(false);
          setEnJuego(false);
          soundManager.playVictory();
        } else {
          setTurnoJugador(false);
          setRondaActual((prev) => prev + 1);
          setTimeout(() => {
            const nuevoPaso = Math.floor(Math.random() * 4);
            const nuevaSecuencia = [...secuencia, nuevoPaso];
            setSecuencia(nuevaSecuencia);
            reproducirSecuencia(nuevaSecuencia);
          }, 800);
        }
      }
    } else {
      soundManager.playLocked();
      setHaFallado(true);
      setTurnoJugador(false);
    }
  };

  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  if (pantalla === 'config') {
    return (
      <div className="secuencia-wrapper config-screen">
        <div className="config-box clean-modal-box">
          <h2>Configuración de Secuencia</h2>
          <div className="config-section">
            <label>Dificultad:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${dificultad === 'facil' ? 'active' : ''}`} onClick={() => setDificultad('facil')}>Fácil (5 rondas)</button>
              <button className={`diff-btn ${dificultad === 'medio' ? 'active' : ''}`} onClick={() => setDificultad('medio')}>Medio (8 rondas)</button>
              <button className={`diff-btn ${dificultad === 'dificil' ? 'active' : ''}`} onClick={() => setDificultad('dificil')}>Difícil (12 rondas)</button>
            </div>
          </div>
          <div className="config-section">
            <label>Tiempo Límite:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${limiteTiempo === 180 ? 'active' : ''}`} onClick={() => setLimiteTiempo(180)}>3 Min</button>
              <button className={`diff-btn ${limiteTiempo === 300 ? 'active' : ''}`} onClick={() => setLimiteTiempo(300)}>5 Min</button>
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
    <div className="secuencia-wrapper">
      <div className="secuencia-content">
        <div className="secuencia-card">
          <div className="metrics-strip">
            <div className="metric-chip">
              <span className="metric-label">Ronda</span>
              <span className="metric-val">{rondaActual} / {config.metaRondas}</span>
            </div>
            <div className="metric-chip">
              <span className="metric-label">{limiteTiempo > 0 ? 'Tiempo Restante' : 'Tiempo'}</span>
              <span className={`metric-val ${limiteTiempo > 0 && tiempoSegundos <= 10 ? 'time-warning' : ''}`}>
                {formatoTiempo(tiempoSegundos)}
              </span>
            </div>
            <button className="btn-secondary-action reset-btn" onClick={() => setPantalla('config')}>Configurar</button>
          </div>

          <div className="turn-banner">
            {haFallado ? (
               <h2 className="turn-text fallido">Fallaste</h2>
            ) : haGanado ? (
               <h2 className="turn-text ganado">¡Ganaste!</h2>
            ) : turnoJugador ? (
               <h2 className="turn-text jugador">¡TU TURNO!</h2>
            ) : (
               <h2 className="turn-text maquina">Observa la Secuencia...</h2>
            )}
          </div>

          <div className="simon-board-container" style={{ position: 'relative', width: '100%' }}>
            <div className="simon-board" style={{ opacity: haFallado ? 0.3 : 1 }}>
              {PADS.map((pad) => (
                <button
                  key={pad.id}
                  className={`simon-pad ${pad.colorClase} ${padActivo === pad.id ? 'active' : ''}`}
                  onClick={() => handlePadClick(pad.id)}
                  disabled={!turnoJugador || haGanado || haFallado || haPerdidoTiempo}
                >
                  <img src={pad.imagen} alt={pad.nombre} className="pad-icon-img" />
                </button>
              ))}
              <div className="simon-center-circle">
                <span className="center-score">{rondaActual}</span>
                <span className="center-label">NIVEL</span>
              </div>
            </div>

            {haFallado && !haPerdidoTiempo && (
              <div className="fail-overlay">
                <button className="btn-primary-action retry-btn" onClick={reintentarRonda}>Reintentar Ronda</button>
              </div>
            )}
          </div>

          <p className="mouse-hint">
            {turnoJugador 
              ? 'Haz clic sobre los botones en el mismo orden que se iluminaron.'
              : 'Memoriza la secuencia que se está iluminando...'}
          </p>
        </div>
      </div>

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <div className="victory-icon-bubble">¡OK!</div>
            <h2>¡Memoria Prodigiosa!</h2>
            <p>Has memorizado las {config.metaRondas} rondas con éxito en dificultad <strong>{dificultad.toUpperCase()}</strong>.</p>
            <div className="victory-summary-stats">
              <div className="summary-col">
                <span className="sum-label">Rondas Logradas</span>
                <span className="sum-value">{config.metaRondas}</span>
              </div>
              <div className="summary-col">
                <span className="sum-label">Tiempo</span>
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

      {haPerdidoTiempo && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
            <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>!</div>
            <h2>¡Se acabó el tiempo!</h2>
            <p>Se te acabó el tiempo antes de terminar la secuencia.</p>
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
