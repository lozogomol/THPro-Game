import React, { useState, useEffect, useRef } from 'react';
import './Rompecabezas.css';
import { soundManager } from '../../utils/audio';

// Importamos todas las imágenes solicitadas
import rn1Img from '../../assets/R-N-1.png';
import rn2Img from '../../assets/R-N-2.png';
import rn3Img from '../../assets/R-N-3.png';
import rn4Img from '../../assets/R-N-4.png';
import rn5Img from '../../assets/R-N-5.png';

export type DificultadRompecabezas = 'facil' | 'medio' | 'dificil';
export type TiempoLimite = number;

export interface ImagenPreset {
  id: string;
  nombre: string;
  url: string;
}

const IMAGENES_PRESET: ImagenPreset[] = [
  { id: 'rn1', nombre: 'THPro - Talento Humano 1', url: rn1Img },
  { id: 'rn2', nombre: 'THPro - Talento Humano 2', url: rn2Img },
  { id: 'rn3', nombre: 'THPro - Talento Humano 3', url: rn3Img },
  { id: 'rn4', nombre: 'THPro - Talento Humano 4', url: rn4Img },
  { id: 'rn5', nombre: 'THPro - Talento Humano 5', url: rn5Img }
];

export interface Pieza {
  id: number;
  originalIndex: number;
}

interface RompecabezasProps {
  onVolver: () => void;
  onResultado: (victoria: boolean, premio: string) => void;
}

export default function Rompecabezas({ onVolver, onResultado }: RompecabezasProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('config');
  const [dificultad, setDificultad] = useState<DificultadRompecabezas>('dificil');
  const [limiteTiempo, setLimiteTiempo] = useState<TiempoLimite>(80);
  const [gridSize, setGridSize] = useState<number>(5);

  const [imagenActual, setImagenActual] = useState<ImagenPreset>(IMAGENES_PRESET[0]);

  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [indiceArrastrado, setIndiceArrastrado] = useState<number | null>(null);
  const [indiceSobrevolado, setIndiceSobrevolado] = useState<number | null>(null);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(null);

  const [movimientos, setMovimientos] = useState<number>(0);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);
  const [enJuego, setEnJuego] = useState<boolean>(false);
  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haPerdidoTiempo, setHaPerdidoTiempo] = useState<boolean>(false);
  const [mostrarGuia, setMostrarGuia] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && piezas.length === 0) {
      iniciarJuego();
    }
  }, [pantalla]);

  const iniciarJuego = (forcedGridSize?: number, forcedTime?: number) => {
    const size = forcedGridSize || gridSize;
    const numPiezas = size * size;
    const indices = Array.from({ length: numPiezas }, (_, i) => i);
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const nuevoArray = indices.map((idx, i) => ({
      id: i,
      originalIndex: idx
    }));

    setPiezas(nuevoArray);
    setIndiceArrastrado(null);
    setIndiceSobrevolado(null);
    setIndiceSeleccionado(null);
    setMovimientos(0);
    setHaGanado(false);
    setHaPerdidoTiempo(false);
    setEnJuego(true);
    setTiempoSegundos(forcedTime !== undefined ? forcedTime : (limiteTiempo > 0 ? limiteTiempo : 0));
    setPantalla('juego');
  };

  useEffect(() => {
    if (enJuego && !haGanado && !haPerdidoTiempo) {
      timerRef.current = window.setInterval(() => {
        setTiempoSegundos((prev) => {
          if (limiteTiempo > 0) {
            if (prev <= 1) {
              setHaPerdidoTiempo(true);
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
  }, [enJuego, haGanado, haPerdidoTiempo, limiteTiempo]);

  const formatoTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const getPremio = (dif: string) => {
    if (dif === 'facil' || dif === 'aprendiz') return '';
    if (dif === 'medio' || dif === 'talentoso') return 'Un Premio';
    if (dif === 'dificil' || dif === 'maestro') return 'Masaje Exprés';
    return '';
  };

  const intercambiarPiezas = (origen: number, destino: number) => {
    if (origen === destino) return;
    const nuevasPiezas = [...piezas];
    const temp = nuevasPiezas[origen];
    nuevasPiezas[origen] = nuevasPiezas[destino];
    nuevasPiezas[destino] = temp;
    soundManager.playSwap();
    setPiezas(nuevasPiezas);
    setMovimientos((prev) => prev + 1);
    setIndiceSeleccionado(null);
    const resuelto = nuevasPiezas.every((p, idx) => p.originalIndex === idx);
    if (resuelto) {
      setHaGanado(true);
      setEnJuego(false);
      soundManager.playVictory();
      onResultado(true, getPremio(dificultad));
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (haGanado || haPerdidoTiempo) return;
    setIndiceArrastrado(index);
    e.dataTransfer.effectAllowed = 'move';
    soundManager.playClick();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (haGanado || haPerdidoTiempo) return;
    setIndiceSobrevolado(index);
  };

  const handleDragLeave = () => {
    setIndiceSobrevolado(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (indiceArrastrado !== null && indiceArrastrado !== dropIndex) {
      intercambiarPiezas(indiceArrastrado, dropIndex);
    }
    setIndiceArrastrado(null);
    setIndiceSobrevolado(null);
  };

  const handleDragEnd = () => {
    setIndiceArrastrado(null);
    setIndiceSobrevolado(null);
  };

  const handlePiezaClick = (index: number) => {
    if (haGanado || haPerdidoTiempo) return;
    
    if (indiceSeleccionado === null) {
      setIndiceSeleccionado(index);
      soundManager.playClick();
    } else {
      intercambiarPiezas(indiceSeleccionado, index);
    }
  };

  const handleSeleccionarNivel = (nivel: 'facil'|'medio'|'dificil'|string) => {
    let newGridSize = gridSize;
    let newTime = limiteTiempo;
    if (nivel === 'aprendiz') { setDificultad('facil'); setGridSize(3); newGridSize = 3; setLimiteTiempo(60); newTime = 60; }
    if (nivel === 'talentoso') { setDificultad('medio'); setGridSize(4); newGridSize = 4; setLimiteTiempo(60); newTime = 60; }
    if (nivel === 'maestro') { setDificultad('dificil'); setGridSize(5); newGridSize = 5; setLimiteTiempo(95); newTime = 95; }
    setPantalla('juego');
    iniciarJuego(newGridSize, newTime);
  };

  if (pantalla === 'config') {
    return (
      <div className="rompecabezas-wrapper config-screen-layout">
        
        {/* Contenedor 1: Configuración completa */}
        <div className="config-box clean-modal-box config-box-item">
          <h2 style={{ textAlign: 'center' }}>Nivel de Rompecabeza<br />THPro S.R.L.</h2>
          <div className="config-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

        {/* Contenedor 2: Vista Previa y Selección con Botones */}
        <div className="config-box clean-modal-box config-box-item">
          <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Selección de Rompecabezas</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <button 
              className="btn-secondary-action" 
              style={{ padding: '4px 8px', fontSize: '1rem', minWidth: '35px' }}
              onClick={() => {
                const idx = IMAGENES_PRESET.findIndex(i => i.id === imagenActual.id);
                const prev = idx > 0 ? idx - 1 : IMAGENES_PRESET.length - 1;
                setImagenActual(IMAGENES_PRESET[prev]);
              }}
            >
              ◀
            </button>
            <h3 style={{ fontSize: '1.1rem', margin: '0 10px', textAlign: 'center', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {imagenActual.nombre}
            </h3>
            <button 
              className="btn-secondary-action" 
              style={{ padding: '4px 8px', fontSize: '1rem', minWidth: '35px' }}
              onClick={() => {
                const idx = IMAGENES_PRESET.findIndex(i => i.id === imagenActual.id);
                const next = idx < IMAGENES_PRESET.length - 1 ? idx + 1 : 0;
                setImagenActual(IMAGENES_PRESET[next]);
              }}
            >
              ▶
            </button>
          </div>

          <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '10px' }}>
            <img 
              src={imagenActual.url} 
              alt={imagenActual.nombre} 
              style={{ width: '100%', height: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} 
            />
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="rompecabezas-wrapper">
      
      <div className="game-layout">
        <div className="board-container-card" style={{ position: 'relative' }}>
          
          <div className="metrics-strip">
            <div 
              className="metric-chip config-chip" 
              onClick={() => setMostrarGuia(true)} 
              style={{ cursor: 'pointer', order: 98 }}
              title="Ver Imagen Guía"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-main)' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
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

          {/* Wrapper que permite la flexibilidad y el ratio 1:1 dinámico */}
          <div className="puzzle-grid-wrapper">
            <div 
              className="puzzle-grid-frame"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`
              }}
            >
              {piezas.map((pieza, index) => {
                const fila = Math.floor(pieza.originalIndex / gridSize);
                const col = pieza.originalIndex % gridSize;
                const posX = (col / (gridSize - 1)) * 100;
                const posY = (fila / (gridSize - 1)) * 100;

                const estaSeleccionada = indiceSeleccionado === index;
                const esArrastrado = indiceArrastrado === index;
                const esSobrevolado = indiceSobrevolado === index;
                const enPosicion = pieza.originalIndex === index;

                return (
                  <div
                    key={pieza.id}
                    className={`puzzle-piece ${estaSeleccionada ? 'selected' : ''} ${esArrastrado ? 'dragging' : ''} ${esSobrevolado ? 'drag-over' : ''} ${enPosicion ? 'correct-pos' : ''}`}
                    draggable={!haGanado && !haPerdidoTiempo}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handlePiezaClick(index)}
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${imagenActual.url})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${posX}% ${posY}%`
                    }}
                  >
                    {estaSeleccionada && (
                      <div className="selection-ring"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mouse-hint">Arrastra una pieza sobre otra o haz clic en dos para intercambiarlas.</p>
        </div>
        
        <div className="preview-side-container" onClick={() => setMostrarGuia(true)}>
          <img src={imagenActual.url} alt="Guía miniatura" className="preview-side-img" />
          <span className="preview-side-text">Ver Guía</span>
        </div>
      </div>

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <div className="victory-icon-bubble">¡OK!</div>
            <h2 style={{ textAlign: "center", color: "var(--rosa-hover)", margin: "10px 0" }}>{getPremio(dificultad) === '' ? '¡Ganaste!' : `¡Ganaste ${getPremio(dificultad)}!`}</h2>
            <div className="victory-solved-thumb">
              <img src={imagenActual.url} alt="Completado" />
            </div>
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

      {haPerdidoTiempo && (
        <div className="clean-modal-backdrop victory-backdrop">
            <div className="clean-modal-box victory-box" style={{ borderColor: '#ef4444' }}>
              <div className="victory-icon-bubble" style={{ backgroundColor: '#ef4444', color: '#fff' }}>X</div>
              <h2 style={{ textAlign: "center", margin: "15px 0 25px" }}>¡Perdiste!</h2>
              <div className="victory-btn-group">
                <button className="btn-primary-action" onClick={onVolver}>Volver al Menú</button>
              </div>
            </div>
          </div>
      )}
    
      {mostrarGuia && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={() => setMostrarGuia(false)}>
          <span style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '2rem', cursor: 'pointer', fontWeight: 'bold' }}>&times;</span>
          <img src={imagenActual.url} alt="Guía" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }} />
          <p style={{ color: '#fff', marginTop: '16px', fontSize: '1.2rem', fontWeight: 600 }}>Toca para cerrar</p>
        </div>
      )}
    </div>
  );
}
