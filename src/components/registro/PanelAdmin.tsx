import { useEffect, useState } from 'react';

export interface JugadorRecord {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  juego: string;
  fecha: string;
  resultado?: string;
  premio?: string;
}

interface PanelAdminProps {
  onCerrar: () => void;
}

export default function PanelAdmin({ onCerrar }: PanelAdminProps) {
  const [jugadores, setJugadores] = useState<JugadorRecord[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('thpro_jugadores');
    if (data) {
      try {
        setJugadores(JSON.parse(data));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const exportarExcel = () => {
    if (jugadores.length === 0) return;
    
    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <style>
          th { background-color: #f1f5f9; font-weight: bold; }
          td, th { border: 1px solid #ccc; padding: 5px; text-align: left; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Juego</th>
              <th>Resultado</th>
              <th>Premio</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${jugadores.map(j => `
              <tr>
                <td>${j.nombre}</td>
                <td>${j.apellido}</td>
                <td>${j.telefono}</td>
                <td>${j.juego}</td>
                <td>${j.resultado || '-'}</td>
                <td>${j.premio || '-'}</td>
                <td>${j.fecha}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "jugadores_thpro.xls");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const borrarDatos = () => {
    if (window.confirm('¿Estás seguro de borrar todos los registros? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('thpro_jugadores');
      setJugadores([]);
    }
  };

  return (
    <div className="clean-modal-backdrop">
      <div className="clean-modal-box" style={{ maxWidth: '950px', width: '95%' }}>
        <div className="clean-modal-header">
          <h3>Panel de Jugadores</h3>
          <button className="btn-close-modal" onClick={onCerrar}>✕</button>
        </div>
        <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {jugadores.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay jugadores registrados aún.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Nombre</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Apellido</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Teléfono</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Juego</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Resultado</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Premio</th>
                    <th style={{ padding: '12px', borderBottom: '2px solid var(--border-light)', color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadores.map(j => (
                    <tr key={j.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontSize: '0.9rem' }}>{j.nombre}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem' }}>{j.apellido}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem' }}>{j.telefono}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem', textTransform: 'capitalize' }}>{j.juego}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem', fontWeight: 'bold', color: j.resultado === 'Ganó' ? '#10b981' : (j.resultado === 'Perdió' ? '#ef4444' : 'var(--text-muted)') }}>{j.resultado || '-'}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--rosa-hover)' }}>{j.premio || '-'}</td>
                      <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{new Date(j.fecha).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#f8fafc' }}>
          <button className="btn-secondary-action" style={{ width: 'auto', padding: '8px 16px', borderColor: '#ef4444', color: '#ef4444' }} onClick={borrarDatos}>Borrar Datos</button>
          <button className="btn-primary-action" style={{ width: 'auto', padding: '8px 16px' }} onClick={exportarExcel}>Descargar a Excel</button>
        </div>
      </div>
    </div>
  );
}
