import React, { useState, useEffect, useRef } from 'react';
import './Rompecabezas.css';
import { soundManager } from '../../utils/audio';

import rn1Img from '../../assets/R-N-1.png';

export type DificultadRompecabezas = 'facil' | 'medio' | 'dificil';
export type TiempoLimite = 180 | 300;

export interface ImagenPreset {
  id: string;
  nombre: string;
  url: string;
}

const IMAGENES_PRESET: ImagenPreset[] = [
  { id: 'rn1-thpro', nombre: 'THPro - Talento Humano', url: rn1Img },
  { id: 'cyberpunk', nombre: 'Ciudad Neón', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80' },
  { id: 'arcade', nombre: 'Sala Arcade', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80' },
  { id: 'galaxia', nombre: 'Nebulosa Rosa', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80' }
];

export interface Pieza {
  id: number;
  originalIndex: number;
}

interface RompecabezasProps {
  onVolver: () => void;
}

export default function Rompecabezas({ onVolver }: RompecabezasProps) {
  const [pantalla, setPantalla] = useState<'config' | 'juego'>('juego');
  const [dificultad, setDificultad] = useState<DificultadRompecabezas>('dificil');
  const [limiteTiempo, setLimiteTiempo] = useState<TiempoLimite>(300);

  const gridSize = dificultad === 'facil' ? 3 : dificultad === 'medio' ? 4 : 5;

  const [imagenActual, setImagenActual] = useState<ImagenPreset>(IMAGENES_PRESET[0]);
  const [mostrarModalImagen, setMostrarModalImagen] = useState<boolean>(false);

  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [indiceArrastrado, setIndiceArrastrado] = useState<number | null>(null);
  const [indiceSobrevolado, setIndiceSobrevolado] = useState<number | null>(null);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(null);

  const [movimientos, setMovimientos] = useState<number>(0);
  const [tiempoSegundos, setTiempoSegundos] = useState<number>(0);
  const [enJuego, setEnJuego] = useState<boolean>(false);
  const [haGanado, setHaGanado] = useState<boolean>(false);
  const [haPerdidoTiempo, setHaPerdidoTiempo] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (pantalla === 'juego' && !enJuego && piezas.length === 0) {
      iniciarJuego();
    }
  }, [pantalla]);

  const iniciarJuego = (tamano: number = gridSize) => {
    soundManager.playClick();
    const count = tamano * tamano;
    let nuevoArray: Pieza[] = [];
    let estaResuelto = true;
    while (estaResuelto) {
      nuevoArray = Array.from({ length: count }, (_, i) => ({ id: i, originalIndex: i })).sort(() => Math.random() - 0.5);
      estaResuelto = nuevoArray.every((p, idx) => p.originalIndex === idx);
    }
    setPiezas(nuevoArray);
    setIndiceArrastrado(null);
    setIndiceSobrevolado(null);
    setIndiceSeleccionado(null);
    setMovimientos(0);
    setTiempoSegundos(limiteTiempo > 0 ? limiteTiempo : 0);
    setHaGanado(false);
    setHaPerdidoTiempo(false);
    setEnJuego(true);
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
    if (indiceArrastrado !== null && indiceArrastrado !== index) {
      setIndiceSobrevolado(index);
    }
  };

  const handleDragLeave = () => {
    setIndiceSobrevolado(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, indexDestino: number) => {
    e.preventDefault();
    if (indiceArrastrado === null) return;
    intercambiarPiezas(indiceArrastrado, indexDestino);
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
      soundManager.playClick();
      setIndiceSeleccionado(index);
    } else if (indiceSeleccionado === index) {
      soundManager.playClick();
      setIndiceSeleccionado(null);
    } else {
      intercambiarPiezas(indiceSeleccionado, index);
    }
  };

  const boardPixelSize = 270;
  const tileSize = Math.floor(boardPixelSize / gridSize);

  if (pantalla === 'config') {
    return (
      <div className="rompecabezas-wrapper config-screen">
        <div className="config-box clean-modal-box">
          <h2>Configuración del Rompecabezas</h2>
          
          <div className="config-section">
            <label>Dificultad:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${dificultad === 'facil' ? 'active' : ''}`} onClick={() => setDificultad('facil')}>Fácil (3x3)</button>
              <button className={`diff-btn ${dificultad === 'medio' ? 'active' : ''}`} onClick={() => setDificultad('medio')}>Medio (4x4)</button>
              <button className={`diff-btn ${dificultad === 'dificil' ? 'active' : ''}`} onClick={() => setDificultad('dificil')}>Difícil (5x5)</button>
            </div>
          </div>

          <div className="config-section">
            <label>Tiempo Límite:</label>
            <div className="difficulty-pill-group">
              <button className={`diff-btn ${limiteTiempo === 180 ? 'active' : ''}`} onClick={() => setLimiteTiempo(180)}>3 Minutos</button>
              <button className={`diff-btn ${limiteTiempo === 300 ? 'active' : ''}`} onClick={() => setLimiteTiempo(300)}>5 Minutos</button>
            </div>
          </div>

          <div className="config-section">
            <label>Imagen Inicial:</label>
            <div className="image-selector-tabs" style={{flexWrap: 'wrap'}}>
              {IMAGENES_PRESET.map((img) => (
                <button
                  key={img.id}
                  className={`img-tab-btn ${imagenActual.id === img.id ? 'active' : ''}`}
                  onClick={() => setImagenActual(img)}
                >
                  {img.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="victory-btn-group" style={{ marginTop: '20px' }}>
            <button className="btn-primary-action" onClick={() => iniciarJuego(gridSize)}>¡Jugar!</button>
            <button className="btn-secondary-action" onClick={onVolver}>Volver al Menú</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rompecabezas-wrapper">
      <div className="game-layout">
        <div className="board-container-card">
          <div className="metrics-strip">
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

          <div 
            className="puzzle-grid-frame"
            style={{
              width: `${gridSize * tileSize + (gridSize - 1) * 4}px`,
              gridTemplateColumns: `repeat(${gridSize}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${gridSize}, ${tileSize}px)`
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
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
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
          <p className="mouse-hint">Arrastra una pieza sobre otra o haz clic en dos para intercambiarlas.</p>
        </div>

        <div className="side-panel">
          <div className="side-card preview-card">
            <div className="side-card-header">
              <h3>Vista Previa</h3>
              <button className="btn-text-action" onClick={() => setMostrarModalImagen(true)}>Ampliar</button>
            </div>
            <div className="preview-img-container" onClick={() => setMostrarModalImagen(true)}>
              <img src={imagenActual.url} alt={imagenActual.nombre} />
            </div>

            <h3 className="list-title">Seleccionar Rompecabezas</h3>
            <div className="image-selector-list">
              {IMAGENES_PRESET.map((img) => (
                <button
                  key={img.id}
                  className={`img-list-item ${imagenActual.id === img.id ? 'active' : ''}`}
                  onClick={() => {
                    setImagenActual(img);
                    if (enJuego) iniciarJuego(gridSize);
                  }}
                >
                  <img src={img.url} alt={img.nombre} className="img-list-thumb" />
                  <span className="img-list-name">{img.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {mostrarModalImagen && (
        <div className="clean-modal-backdrop" onClick={() => setMostrarModalImagen(false)}>
          <div className="clean-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="clean-modal-header">
              <h3>{imagenActual.nombre}</h3>
              <button className="btn-close-modal" onClick={() => setMostrarModalImagen(false)}>✕</button>
            </div>
            <img src={imagenActual.url} alt={imagenActual.nombre} className="modal-full-img" />
          </div>
        </div>
      )}

      {haGanado && (
        <div className="clean-modal-backdrop victory-backdrop">
          <div className="clean-modal-box victory-box">
            <div className="victory-icon-bubble">¡OK!</div>
            <h2>¡Rompecabezas Completado!</h2>
            <p>Has resuelto con éxito la imagen en dificultad <strong>{dificultad.toUpperCase()}</strong>.</p>
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
              <button className="btn-primary-action" onClick={() => iniciarJuego(gridSize)}>Jugar de Nuevo</button>
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
            <p>No pudiste completar el rompecabezas a tiempo.</p>
            <div className="victory-btn-group">
              <button className="btn-primary-action" onClick={() => iniciarJuego(gridSize)}>Reintentar</button>
              <button className="btn-secondary-action" onClick={() => setPantalla('config')}>Volver a Configurar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
