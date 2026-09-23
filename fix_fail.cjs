const fs = require('fs');
const path = require('path');
const file = 'C:/THPro-Game/THPro-Game/src/components/secuencia/Secuencia.tsx';

let content = fs.readFileSync(file, 'utf8');

const regex = /\} else \{\s*soundManager\.playLocked\(\);\s*setHaFallado\(true\);\s*setTurnoJugador\(false\);\s*onResultado\(false, ''\);\s*\}/;

const newFailLogic = `} else {
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
        setPasoUsuario(0);
        setTimeout(() => reproducirSecuencia(secuencia), 500);
        return nuevosFallos;
      });
    }`;

content = content.replace(regex, newFailLogic);
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed Secuencia fail logic");
