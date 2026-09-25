/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

interface RegistroProps {
  onSubmit: (datos: { nombre: string; telefono: string }) => void;
  onCancelar: () => void;
}

const esNombreCoherente = (texto: string) => {
  if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/.test(texto)) return false;
  if (texto.trim().length < 2) return false;
  if (!/[aeiouáéíóúAEIOUÁÉÍÓÚ]/.test(texto)) return false;
  if (/(.)\1\1/.test(texto)) return false;
  return true;
};

export default function RegistroJugador({ onSubmit, onCancelar }: RegistroProps) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!esNombreCoherente(nombre)) {
      alert('Por favor, ingresa un nombre completo válido y real.');
      return;
    }

    if (telefono.length !== 8) {
      alert('El número de celular debe tener exactamente 8 dígitos.');
      return;
    }

    if (nombre && telefono.length === 8) {
      onSubmit({ nombre, telefono });
    }
  };

  return (
    <div className="clean-modal-backdrop">
      <div className="clean-modal-box" style={{ maxWidth: '400px' }}>
        <div className="clean-modal-header">
          <h3>Registro de Jugador</h3>
          <button className="btn-close-modal" type="button" onClick={onCancelar}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre Completo:</label>
            <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Celular:</label>
            <input 
              required 
              type="tel" 
              value={telefono} 
              minLength={8}
              maxLength={8}
              onChange={e => {
                const val = e.target.value;
                if (/^\d{0,8}$/.test(val)) {
                  setTelefono(val);
                }
              }} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-light)', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-primary-action">Continuar al Juego</button>
          </div>
        </form>
      </div>
    </div>
  );
}
