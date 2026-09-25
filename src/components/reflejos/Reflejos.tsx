/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Reflejos.css';
import { soundManager } from '../../utils/audio';
import esferaImg from '../../assets/Esfera.png';

export type DificultadReflejos = 'aprendiz' | 'talentoso' | 'maestro';

interface Objetivo {
  id: number;
  x: number;
  y: number;
  tamano: number;
  nacimiento: number;
}

interface ReflejosProps {
  onVolver: () => void;
  onResultado: (victoria: boolean, premio: string) => void;
}

export default function Reflejos({ onVolver, onResultado }: ReflejosProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('config');
  const [dificultad, setDificultad] = useState<DificultadReflejos>('talentoso');
  const [limiteTiempo, setLimiteTiempo] = useState<number>(120);

  const config = {
    aprendiz: { metaAciertos: 12, tiempoObjetivoMs: 2400, tamano: 96, tiempo: 60 },
    talentoso: { metaAciertos: 20, tiempoObjetivoMs: 1600, tamano: 72, tiempo: 40 },
    maestro: { metaAciertos: 30, tiempoObjetivoMs: 1100, tamano: 56, tiempo: 40 }
  }[dificultad];

  const areaRef = useRef<HTMLDivElement | null>(null);

  const crearNuevoObjetivo = useCallback((tamano: number = config.tamano): Objetivo => {
    let maxX = 300;
    let maxY = 300;
    
    if (areaRef.current) {
      maxX = areaRef.current.clientWidth - tamano - 10;
      maxY = areaRef.current.clientHeight - tamano - 10;
    }
    
    const x = Math.max(10, Math.floor(Math.random() * maxX));
    const y = Math.max(10, Math.floor(Math.random() * maxY));
    
    return { id: Date.now() + Math.random(), x, y, tamano, nacimiento: performance.now() };
  }, [config.tamano]);

  const [objetivoActual, setObjetivoActual] = useState<Objetivo | null>(null);
  const [aciertos, setAciertos] = useState<number>(0);
  const [fallos, setFallos] = useState<number>(0);
  const [racha, setRacha] = useState<number>(0);
  const [rachaMax, setRachaMax] = useState<number>(0);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);

  const [enJuego, setEnJuego] = useState<boolean>(false);
  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haPerdido, setHaPerdido] = useState<boolean>(false);

  const timeoutRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const generarObjetivo = useCallback((tamano: number = config.tamano) => {
    setObjetivoActual(crearNuevoObjetivo(tamano));
  }, [config.tamano, crearNuevoObjetivo]);

  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && aciertos === 0 && fallos === 0 && !haGanado && !haPerdido) {
      iniciarJuego();
    }
  }, [pantalla]);

  function iniciarJuego() {
    soundManager.playClick();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setAciertos(0);
    setFallos(0);
    setTiempoSegundos(config.tiempo > 0 ? config.tiempo : 0);
    setHaGanado(false);
    setHaPerdido(false);
    setEnJuego(true);
    setPantalla('juego');
    setObjetivoActual(crearNuevoObjetivo(config.tamano));
  }

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

  useEffect(() => {
    if (!enJuego || haGanado || haPerdido || !objetivoActual) return;
    timeoutRef.current = window.setTimeout(() => {
      setRacha(0);
      generarObjetivo();
    }, config.tiempoObjetivoMs);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [objetivoActual, enJuego, haGanado, haPerdido, config.tiempoObjetivoMs, generarObjetivo]);

  
  useEffect(() => {
    if (enJuego && fallos >= 3 && !haPerdido && !haGanado) {
      setHaPerdido(true);
      setEnJuego(false);
      onResultado(false, '');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [fallos, enJuego, haPerdido, haGanado, onResultado]);

  const getPremio = (dif: string) => {
    if (dif === 'facil' || dif === 'aprendiz') return '';
    if (dif === 'medio' || dif === 'talentoso') return 'Un Premio';
    if (dif === 'dificil' || dif === 'maestro') return 'Masaje Exprés';
    return '';
  };

  const handleClickObjetivo = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!enJuego || haGanado || haPerdido || !objetivoActual) return;
    
    if (objetivoActual && objetivoActual.id === id) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      setObjetivoActual(null);
      soundManager.playMatch();
      
      setAciertos((prevAciertos) => {
        const nuevosAciertos = prevAciertos + 1;
        
        if (nuevosAciertos >= config.metaAciertos) {
          setHaGanado(true);
          setEnJuego(false);
          onResultado(true, getPremio(dificultad));
          soundManager.playVictory();
        } else {
          generarObjetivo();
        }
        
        return nuevosAciertos;
      });

      setRacha((prevRacha) => {
        const nuevaRacha = prevRacha + 1;
        setRachaMax((prevMax) => (nuevaRacha > prevMax ? nuevaRacha : prevMax));
        return nuevaRacha;
      });
    }
  };

  const handleArenaClick = () => {
    if (!enJuego || haGanado || haPerdido) return;
    soundManager.playError();
    setFallos((prev) => prev + 1);
    setRacha(0);
  };

  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleSeleccionarNivel = (nivel: DificultadReflejos) => {
    const cfg = { aprendiz: { tiempo: 60 }, talentoso: { tiempo: 40 }, maestro: { tiempo: 40 } };
    setDificultad(nivel);
    setLimiteTiempo(cfg[nivel].tiempo);
    // Reset all states so useEffect triggers cleanly
    setEnJuego(false);
    setAciertos(0);
    setFallos(0);
    setHaGanado(false);
    setHaPerdido(false);
    setPantalla('juego');
  };

  if (pantalla === 'config') {
    return (
      <div className="reflejos-wrapper config-screen" style={{ padding: '5mm' }}>
        <div className="config-box clean-modal-box">
          <h2 style={{ textAlign: 'center' }}>Nivel de Reflejos<br />THPro S.R.L.</h2>
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
    <div className="reflejos-wrapper" style={{ position: "relative", width: "100%", minHeight: "100%" }}>
      
      

      <div className="reflejos-content">
        <div className="reflejos-card">
          
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
              <span className="metric-label">Atrapados</span>
              <span className="metric-val">{aciertos} / {config.metaAciertos}</span>
              
          </div>
          <div className="metric-chip">
              <span className="metric-label">{limiteTiempo > 0 ? 'Tiempo Restante' : 'Tiempo'}</span>
              <span className={`metric-val ${limiteTiempo > 0 && tiempoSegundos <= 10 ? 'time-warning' : ''}`}>
                {formatoTiempo(tiempoSegundos)}
              </span>
            </div>
            <div className="metric-chip">
              <span className="metric-label">Vidas</span>
              <span className="metric-val" style={{ color: '#ff0000', letterSpacing: '2px', fontSize: '1.4em', textShadow: '0 0 2px rgba(255,0,0,0.3)' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ opacity: i < (3 - fallos) ? 1 : 0.2 }}>❤</span>
                ))}
              </span>
            </div>
          </div>

          <div 
            className="arena-punteria" 
            ref={areaRef}
            onClick={handleArenaClick}
          >
            {objetivoActual && (
              <div 
                className="reflejo-objetivo target-orb"
                style={{ 
                  left: `${objetivoActual.x}px`, 
                  top: `${objetivoActual.y}px`,
                  width: `${objetivoActual.tamano}px`,
                  height: `${objetivoActual.tamano}px`
                }}
                onClick={(e) => handleClickObjetivo(e as any, objetivoActual.id)}
              >
                <img src={esferaImg} alt="Objetivo" draggable={false} className="target-sphere-img" />
              </div>
            )}
            
            {!enJuego && !haGanado && !haPerdido && (
              <div className="start-overlay">
                <p>Presiona <strong>Iniciar Juego</strong> cuando estés listo.</p>
                <button className="btn-primary-action start-btn" onClick={iniciarJuego}>INICIAR</button>
              </div>
            )}
          </div>
          <p className="mouse-hint">Haz clic sobre las imágenes lo más rápido que puedas antes de que desaparezcan.</p>
        </div>
      </div>

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "10px 0" }}>{getPremio(dificultad) === '' ? '¡Ganaste!' : `¡Ganaste ${getPremio(dificultad)}!`}</h2>
            <div className="victory-summary-stats">
              <div className="summary-col">
                <span className="sum-label">Atrapados</span>
                <span className="sum-value">{aciertos}</span>
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
