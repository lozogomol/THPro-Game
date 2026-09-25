/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import './Secuencia.css';
import { soundManager } from '../../utils/audio';

import esteticaFacialImg from '../../assets/Estetica_Facial.png';
import esteticaCorporalImg from '../../assets/Estetica_Corporal.png';
import fisioterapiaImg from '../../assets/Fisioterapia.png';
import gimnasiaLaboralImg from '../../assets/Gimnasia_Laboral.png';

export type DificultadSecuencia = 'aprendiz' | 'talentoso' | 'maestro';

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
  onResultado: (victoria: boolean, premio: string) => void;
}

export default function Secuencia({ onVolver, onResultado }: SecuenciaProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('config');
  const [dificultad, setDificultad] = useState<DificultadSecuencia>('talentoso');
  const [limiteTiempo, setLimiteTiempo] = useState<number>(120);

  const getPremio = (dif: string) => {
    if (dif === 'facil' || dif === 'aprendiz') return '';
    if (dif === 'medio' || dif === 'talentoso') return 'Un Premio';
    if (dif === 'dificil' || dif === 'maestro') return 'Masaje Exprés';
    return '';
  };

  const config = {
    aprendiz: { metaRondas: 6, intervaloMs: 650 },
    talentoso: { metaRondas: 10, intervaloMs: 500 },
    maestro: { metaRondas: 14, intervaloMs: 380 }
  }[dificultad];

  const [secuencia, setSecuencia] = useState<number[]>([]);
  const [, setPasoUsuario] = useState<number>(0);
  const [padActivo, setPadActivo] = useState<number | null>(null);
  const [turnoJugador, setTurnoJugador] = useState<boolean>(false);
  const [rondaActual, setRondaActual] = useState<number>(1);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);

  const [, setFallos] = useState<number>(0);
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

  function iniciarJuego(forcedTime?: number) {
    soundManager.playClick();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setFallos(0);
      setHaGanado(false);
    setHaFallado(false);
    setHaPerdidoTiempo(false);
    setPasoUsuario(0);
    setTurnoJugador(false);
    setRondaActual(1);
    setTiempoSegundos(forcedTime !== undefined ? forcedTime : (limiteTiempo > 0 ? limiteTiempo : 0));
    setEnJuego(true);
    setPantalla('juego');

    const primerPaso = Math.floor(Math.random() * 4);
    const nuevaSecuencia = [primerPaso];
    setSecuencia(nuevaSecuencia);
    setTimeout(() => {
      reproducirSecuencia(nuevaSecuencia);
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
  }, [enJuego, haFallado, haGanado, haPerdidoTiempo, limiteTiempo, onResultado]);

  const handlePadClick = (id: number) => {
    if (!turnoJugador || haGanado || haFallado || haPerdidoTiempo) return;

    setPadActivo(id);
    soundManager.playClick();
    setTimeout(() => setPadActivo(null), 200);

    setPasoUsuario((prevPaso) => {
      if (id === secuencia[prevPaso]) {
        const siguientePaso = prevPaso + 1;
        if (siguientePaso === secuencia.length) {
          if (secuencia.length >= config.metaRondas) {
            setHaGanado(true);
            setTurnoJugador(false);
            setEnJuego(false);
            onResultado(true, getPremio(dificultad));
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
        return siguientePaso;
      } else {
        soundManager.playLocked();
        setFallos(prev => {
          const nuevosFallos = prev + 1;
          if (nuevosFallos >= 2) {
            setHaFallado(true);
            setTurnoJugador(false);
            setEnJuego(false);
            onResultado(false, '');
            if (timerRef.current) clearInterval(timerRef.current);
            return nuevosFallos;
          }
          // Resume! Repeat sequence for them
          setTurnoJugador(false);
          setTimeout(() => reproducirSecuencia(secuencia), 500);
          return nuevosFallos;
        });
        return 0; // Reset pasoUsuario for next attempt
      }
    });
  };

  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const handleSeleccionarNivel = (nivel: DificultadSecuencia) => {
    const tiempos = { aprendiz: 40, talentoso: 100, maestro: 160 };
    setDificultad(nivel);
    setLimiteTiempo(tiempos[nivel]);
    setSecuencia([]);
    setEnJuego(false);
    setHaGanado(false);
    setHaFallado(false);
    setHaPerdidoTiempo(false);
    setPantalla('juego');
    iniciarJuego(tiempos[nivel]);
  };

  if (pantalla === 'config') {
    return (
      <div className="secuencia-wrapper config-screen" style={{ padding: '5mm' }}>
        <div className="config-box clean-modal-box">
          <h2 style={{ textAlign: 'center' }}>Nivel de Secuencia<br />THPro S.R.L.</h2>
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
    <div className="secuencia-wrapper" style={{ position: "relative", width: "100%", minHeight: "100%" }}>
      
      

      <div className="secuencia-content">
        <div className="secuencia-card" style={{ position: 'relative' }}>
  

          
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
              <span className="metric-label">Ronda</span>
              <span className="metric-val">{rondaActual} / {config.metaRondas}</span>
              
          </div>
          <div className="metric-chip">
              <span className="metric-label">{limiteTiempo > 0 ? 'Tiempo Restante' : 'Tiempo'}</span>
              <span className={`metric-val ${limiteTiempo > 0 && tiempoSegundos <= 10 ? 'time-warning' : ''}`}>
                {formatoTiempo(tiempoSegundos)}
              </span>
            </div>
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

          <div className="simon-board-container">
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
            <h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "10px 0" }}>{getPremio(dificultad) === '' ? '¡Ganaste!' : `¡Ganaste ${getPremio(dificultad)}!`}</h2>
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
              <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>
            </div>
          </div>
        </div>
      )}

      {haPerdidoTiempo && (
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
