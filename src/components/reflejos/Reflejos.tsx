import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Reflejos.css';
import { soundManager } from '../../utils/audio';
import esferaImg from '../../assets/Esfera.png';

export type DificultadReflejos = 'facil' | 'medio' | 'dificil';
export type TiempoLimite = 180 | 300;

interface Objetivo {
  id: number;
  x: number;
  y: number;
  tamano: number;
  nacimiento: number;
}

interface ReflejosProps {
  onVolver: () => void;
}

export default function Reflejos({ onVolver }: ReflejosProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('juego');
  const [dificultad, setDificultad] = useState<DificultadReflejos>('dificil');
  const [limiteTiempo, setLimiteTiempo] = useState<TiempoLimite>(300);

  const config = {
    facil: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96 },
    medio: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72 },
    dificil: { metaAciertos: 30, tiempoObjetivoMs: 1100, tamano: 56 }
  }[dificultad];

  const crearNuevoObjetivo = useCallback((tamano: number = config.tamano): Objetivo => {
    const minPadding = 10;
    const maxPadding = 80;
    const x = Math.floor(Math.random() * (maxPadding - minPadding) + minPadding);
    const y = Math.floor(Math.random() * (maxPadding - minPadding) + minPadding);
    return { id: Date.now() + Math.random(), x, y, tamano, nacimiento: performance.now() };
  }, [config.tamano]);

  const [objetivoActual, setObjetivoActual] = useState<Objetivo | null>(null);
  const [aciertos, setAciertos] = useState<number>(0);
  const [fallos, setFallos] = useState<number>(0);
  const [racha, setRacha] = useState<number>(0);
  const [rachaMax, setRachaMax] = useState<number>(0);
  const [reaccionMsTotal, setReaccionMsTotal] = useState<number>(0);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);

  const [enJuego, setEnJuego] = useState<boolean>(false);
  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haPerdido, setHaPerdido] = useState<boolean>(false);

  const timeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);

  const generarObjetivo = useCallback((tamano: number = config.tamano) => {
    setObjetivoActual(crearNuevoObjetivo(tamano));
  }, [config.tamano, crearNuevoObjetivo]);

  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && aciertos === 0 && fallos === 0 && !haGanado && !haPerdido) {
      iniciarJuego();
    }
  }, [pantalla]);

  const iniciarJuego = useCallback(() => {
    soundManager.playClick();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setAciertos(0);
    setFallos(0);
    setRacha(0);
    setRachaMax(0);
    setReaccionMsTotal(0);
    setTiempoSegundos(limiteTiempo > 0 ? limiteTiempo : 0);
    setHaGanado(false);
    setHaPerdido(false);
    setEnJuego(true);
    setPantalla('juego');
    setObjetivoActual(crearNuevoObjetivo(config.tamano));
  }, [config.tamano, crearNuevoObjetivo, limiteTiempo]);

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

  useEffect(() => {
    if (!enJuego || haGanado || haPerdido || !objetivoActual) return;
    timeoutRef.current = window.setTimeout(() => {
      setFallos((prev) => prev + 1);
      setRacha(0);
      generarObjetivo();
    }, config.tiempoObjetivoMs);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [objetivoActual, enJuego, haGanado, haPerdido, config.tiempoObjetivoMs, generarObjetivo]);

  const handleObjetivoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!enJuego || haGanado || haPerdido || !objetivoActual) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    soundManager.playSwap();

    const tiempoReaccion = Math.round(performance.now() - objetivoActual.nacimiento);
    setReaccionMsTotal((prev) => prev + tiempoReaccion);

    const nuevosAciertos = aciertos + 1;
    const nuevaRacha = racha + 1;
    setAciertos(nuevosAciertos);
    setRacha(nuevaRacha);
    if (nuevaRacha > rachaMax) setRachaMax(nuevaRacha);

    if (nuevosAciertos >= config.metaAciertos) {
      setHaGanado(true);
      setEnJuego(false);
      setObjetivoActual(null);
      soundManager.playVictory();
    } else {
      generarObjetivo();
    }
  };

  const handleArenaClick = () => {
    if (!enJuego || haGanado || haPerdido) return;
    soundManager.playLocked();
    setFallos((prev) => prev + 1);
    setRacha(0);
  };

  const tiempoReaccionMedio = aciertos > 0 ? Math.round(reaccionMsTotal / aciertos) : 0;
  const precision = aciertos + fallos > 0 ? Math.round((aciertos / (aciertos + fallos)) * 100) : 100;
  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  if (pantalla === 'config') {
    return (
      <div className="reflejos-wrapper config-screen">
        <div className="config-box clean-modal-box">
          <h2>Configuración de Reflejos</h2>
          <div className="config-section">
            <label>Dificultad:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${dificultad === 'facil' ? 'active' : ''}`} onClick={() => setDificultad('facil')}>Fácil</button>
              <button className={`diff-btn ${dificultad === 'medio' ? 'active' : ''}`} onClick={() => setDificultad('medio')}>Medio</button>
              <button className={`diff-btn ${dificultad === 'dificil' ? 'active' : ''}`} onClick={() => setDificultad('dificil')}>Difícil</button>
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
    <div className="reflejos-wrapper">
      <div className="reflejos-content">
        <div className="reflejos-card">
          <div className="metrics-strip">
            <div className="metric-chip">
              <span className="metric-label">Aciertos</span>
              <span className="metric-val">{aciertos} / {config.metaAciertos}</span>
            </div>
            <div className="metric-chip">
              <span className="metric-label">Precisión</span>
              <span className="metric-val">{precision}%</span>
            </div>
            <div className="metric-chip">
              <span className="metric-label">{limiteTiempo > 0 ? 'Tiempo Restante' : 'Tiempo'}</span>
              <span className={`metric-val ${limiteTiempo > 0 && tiempoSegundos <= 10 ? 'time-warning' : ''}`}>
                {formatoTiempo(tiempoSegundos)}
              </span>
            </div>
            <button className="btn-secondary-action reset-btn" onClick={() => setPantalla('config')}>Configurar</button>
          </div>

          <div ref={arenaRef} className="arena-punteria" onClick={handleArenaClick}>
            {objetivoActual && !haGanado && !haPerdido && (
              <div
                key={objetivoActual.id}
                className="target-orb"
                onClick={handleObjetivoClick}
                style={{ width: `${objetivoActual.tamano}px`, height: `${objetivoActual.tamano}px`, left: `${objetivoActual.x}%`, top: `${objetivoActual.y}%` }}
              >
                <img src={esferaImg} alt="Esfera Objetivo" className="target-sphere-img" draggable={false} />
              </div>
            )}
          </div>
          <p className="mouse-hint">Haz clic rápidamente sobre la esfera antes de que cambie de lugar.</p>
        </div>
      </div>

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <div className="victory-icon-bubble">¡OK!</div>
            <h2>¡Reflejos Asombrosos!</h2>
            <p>Has completado el reto en dificultad <strong>{dificultad.toUpperCase()}</strong>.</p>
            <div className="victory-summary-stats">
              <div className="summary-col">
                <span className="sum-label">Reacción</span>
                <span className="sum-value">{tiempoReaccionMedio} ms</span>
              </div>
              <div className="summary-col">
                <span className="sum-label">Precisión</span>
                <span className="sum-value">{precision}%</span>
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

      {haPerdido && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
            <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>!</div>
            <h2>¡Se acabó el tiempo!</h2>
            <p>No lograste los aciertos a tiempo.</p>
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
