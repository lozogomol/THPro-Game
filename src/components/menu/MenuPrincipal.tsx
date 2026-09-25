/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import './MenuPrincipal.css';
import { soundManager } from '../../utils/audio';
import rompecabezasImg from '../../assets/Rompecabezas.png';
import memoramaImg from '../../assets/Memorama.png';
import reflejosImg from '../../assets/Reflejos.png';
import secuenciaImg from '../../assets/Secuencia.png';

export interface MinijuegoItem {
  id: string;
  titulo: string;
  subtitulo: string;
  icono: string;
  dificultades: string[];
  tema: 'celeste' | 'rosa';
  imagen?: string;
}

const MINIJUEGOS: MinijuegoItem[] = [
  {
    id: 'rompecabezas',
    titulo: 'Rompecabeza THPro S.R.L.',
    subtitulo: 'Reconstruye imágenes reales en cuadrícula',
    icono: '01',
    dificultades: [],
    tema: 'celeste',
    imagen: rompecabezasImg
  },
  {
    id: 'memorama',
    titulo: 'Memorama THPro S.R.L.',
    subtitulo: 'Encuentra las parejas de cartas idénticas',
    icono: '02',
    dificultades: [],
    tema: 'rosa',
    imagen: memoramaImg
  },
  {
    id: 'reflejos',
    titulo: 'Reflejos THPro S.R.L.',
    subtitulo: 'Haz clic en los objetivos a máxima velocidad',
    icono: '03',
    dificultades: [],
    tema: 'celeste',
    imagen: reflejosImg
  },
  {
    id: 'secuencia',
    titulo: 'Secuencia THPro S.R.L.',
    subtitulo: 'Memoriza y repite el patrón de luces',
    icono: '04',
    dificultades: [],
    tema: 'rosa',
    imagen: secuenciaImg
  }
];

interface MenuPrincipalProps {
  onSeleccionarJuego: (juegoId: string) => void;
}

export default function MenuPrincipal({ onSeleccionarJuego }: MenuPrincipalProps) {
  const handleClick = (id: string) => {
    soundManager.playClick();
    onSeleccionarJuego(id);
  };

  return (
    <div className="menu-container-clean">
      <div className="cards-grid-clean">
        {MINIJUEGOS.map((juego) => (
          <div
            key={juego.id}
            className={`card-game-clean card-${juego.tema}`}
            onClick={() => handleClick(juego.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick(juego.id);
              }
            }}
          >
            <div className="card-cover">
              {juego.imagen ? (
                <img src={juego.imagen} alt={juego.titulo} className="card-cover-img" />
              ) : (
                <div className="card-top-icon">
                  <span>{juego.icono}</span>
                </div>
              )}
            </div>

            <div className="card-body">
              <h2 className="card-title">{juego.titulo}</h2>
              <div className="card-footer-btn">
                <span className="btn-play-label">JUGAR</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
