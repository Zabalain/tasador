'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Historial permanente y buscador
  const [historial, setHistorial] = useState([]);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);

  // Cargar HISTORIAL PERMANENTE sin importar la fecha
  useEffect(() => {
    const guardado = localStorage.getItem('historial_tasaciones_permanente');
    if (guardado) {
      setHistorial(JSON.parse(guardado));
    }
  }, []);

  const ejecutarTasacion = async (consultaAEnviar) => {
    setLoading(true);
    setError('');
    setFeedbackEnviado(false);
    
    // ANALIZAR COMPORTAMIENTO PASADO: Contamos tus últimas correcciones para enviárselas a la IA
    const ultimosAjustes = historial.slice(0, 10).map(h => h.feedback).filter(f => f && f !== 'Sin ajustar');
    const altos = ultimosAjustes.filter(f => f.includes('Alto')).length;
    const bajos = ultimosAjustes.filter(f => f.includes('Bajo')).length;
    
    // Creamos un sesgo basado en tus botones: si marcas "Alto", exigimos bajar más los precios
    let ordenCorreccion = "Sigue la fórmula estándar.";
    if (altos > bajos) {
      ordenCorreccion = `ATENCIÓN: El usuario profesional indica que estás tasando muy ALTO en sus últimos coches. Sé más agresivo y resta un 10% extra en el canal B2B y Tasación para proteger su margen.`;
    } else if (bajos > altos) {
      ordenCorreccion = `ATENCIÓN: El usuario profesional indica que estás tasando muy BAJO. Sube un 5% el margen de tasación general.`;
    }

    try {
      // Enviamos la consulta combinada con tu feedback acumulado
      const res = await fetch('/api/tasar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: `${consultaAEnviar} [Contexto Corrección Profesional: ${ordenCorreccion}]` 
        })
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
        
        // Guardar con Fecha Completa (Día/Mes/Año) para consultas de hace meses
        const nuevaTasacion = {
          id: Date.now(),
          fecha: new Date().toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
          vehiculo: consultaAEnviar,
          tasacion: result.precioTasacion,
          b2b: result.precioB2B,
          medio: result.precioVentaMedio,
          feedback: 'Sin ajustar'
        };
        const nuevoHistorial = [nuevaTasacion, ...historial];
        setHistorial(nuevoHistorial);
        localStorage.setItem('historial_tasaciones_permanente', JSON.stringify(nuevoHistorial));
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } block {
      setLoading(false);
    }
  };

  const handleTasar = (e) => {
    e.preventDefault();
    if (!query) return;
    ejecutarTasacion(query);
  };

  const handleFeedback = (tipo) => {
    setFeedbackEnviado(tipo);
    
    if (historial.length > 0) {
      const nuevoHistorial = [...historial];
      nuevoHistorial[0].feedback = tipo;
      setHistorial(nuevoHistorial);
      localStorage.setItem('historial_tasaciones_permanente', JSON.stringify(nuevoHistorial));
    }
  };

  const handleNuevaTasacion = () => {
    setData(null);
    setQuery('');
    setFeedbackEnviado(false);
  };

  const eliminarDelHistorial = (id) => {
    const filtrado = historial.filter(item => item.id !== id);
    setHistorial(filtrado);
    localStorage.setItem('historial_tasaciones_permanente', JSON.stringify(filtrado));
  };

  const limpiarTodoElHistorial = () => {
    if(confirm("🚨 ¿Seguro que quieres borrar TODO el historial permanente? Perderás los registros de meses anteriores.")) {
      setHistorial([]);
      localStorage.removeItem('historial_tasaciones_permanente');
    }
  };

  const obtenerEstilosRotacion = (rotacion) => {
    switch (rotacion) {
      case 'ALTA': return { backgroundColor: '#22c55e', color: '#fff', labelColor: '#fff' };
      case 'MEDIA': return { backgroundColor: '#eab308', color: '#1e1b4b', labelColor: '#451a03' };
      case 'BAJA': return { backgroundColor: '#ef4444', color: '#fff', labelColor: '#fff' };
      default: return { backgroundColor: '#fff', color: '#111', labelColor: '#666' };
    }
  };

  const estilosRotacion = data && !data.necesitaAclaracion ? obtenerEstilosRotacion(data.rotacion) : {};

  const historialFiltrado = historial.filter(item => 
    item.vehiculo.toLowerCase().includes(busquedaHistorial.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      {/* Cabecera */}
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
          Tasador <span style={{ color: '#2563eb' }}>Autos del Norte</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Historial Permanente e IA Calibrada</p>
      </div>
      
      {/* Formulario Principal */}
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '16px' }}>
        <form onSubmit={handleTasar}>
          <textarea 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ej: Fiat 500L 2013 213000kms" 
            rows={2}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', resize: 'none', marginBottom: '12px', textAlign: 'center' }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#e2e8f0' : '#2563eb', color: loading ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? '🔄 Consultando mercado real...' : 'REALIZAR TASACIÓN'}
          </button>
        </form>
      </div>

      {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fee2e2', textAlign: 'center' }}>{error}</div>}

      {/* RESULTADOS ACTUALES */}
      {data && !data.necesitaAclaracion && (
        <div style={{ marginBottom: '20px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px' }}>PRECIO TASACIÓN</span>
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>{data.precioTasacion}€</span>
            </div>

            <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '6px' }}>PRECIO B2B COMPRAVENTAS</span>
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>{data.precioB2B}€</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ flex: 1, backgroundColor: '#fff', padding: '12px 6px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: '#e11d48', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', lineHeight: '1.1' }}>MÁS BARATO INTERNET</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{data.masBaratoInternet} €</span>
            </div>

            <div style={{ flex: 1, backgroundColor: '#fff', padding: '12px 6px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: '#4b5563', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', lineHeight: '1.1' }}>PVP MEDIO SIMILARES</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{data.precioVentaMedio} €</span>
            </div>

            <div style={{ flex: 0.9, backgroundColor: estilosRotacion.backgroundColor, padding: '12px 6px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', color: estilosRotacion.labelColor, fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9 }}>ROTACIÓN</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: estilosRotacion.color }}>{data.rotacion}</span>
            </div>
          </div>

          {/* BOTONES DE CONTROL DE SESGO */}
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '16px', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              ¿Precio adecuado al mercado real? (Calibrará la IA)
            </span>
            {!feedbackEnviado ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => handleFeedback('Demasiado Alto 📈')} style={{ flex: 1, padding: '10px 4px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  DEMASIADO ALTO
                </button>
                <button type="button" onClick={() => handleFeedback('Correcto  ✅')} style={{ flex: 1, padding: '10px 4px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  CORRECTO
                </button>
                <button type="button" onClick={() => handleFeedback('Demasiado Bajo 📉')} style={{ flex: 1, padding: '10px 4px', backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  DEMASIADO BAJO
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: 'bold' }}>
                Ajuste guardado. Tu sesgo se aplicará en el próximo vehículo.
              </span>
            )}
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px', borderRadius: '0 12px 12px 0', fontSize: '14px', color: '#1e40af', lineHeight: '1.5', marginBottom: '16px' }}>
            <strong>PUNTOS CRÍTICOS DE INSPECCIÓN:</strong><br />{data.resumen}
          </div>

          <button type="button" onClick={handleNuevaTasacion} style={{ width: '100%', padding: '14px', backgroundColor: '#f3f4f6', color: '#1f2937', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
            🔄 BORRAR PANTALLA PARA OTRO COCHE
          </button>
        </div>
      )}

      <hr style={{ border: '0', height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0' }} />

      {/* SECCIÓN HISTORIAL TOTAL PERMANENTE */}
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#111', margin: 0, textTransform: 'uppercase' }}>
            Historial de Tasaciones ({historial.length})
          </h3>
          {historial.length > 0 && (
            <button onClick={limpiarTodoElHistorial} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
              VACIAR TODO
            </button>
          )}
        </div>

        <input 
          type="text" 
          value={busquedaHistorial}
          onChange={(e) => setBusquedaHistorial(e.target.value)}
          placeholder="🔎 Buscar coche o fecha (ej: Dacia, 2026...)" 
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', boxSizing: 'border-box', marginBottom: '12px' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {historialFiltrado.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', margin: '20px 0' }}>
              No hay registros en el historial.
            </p>
          ) : (
            historialFiltrado.map((item) => (
              <div key={item.id} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #f3f4f6', backgroundColor: '#f9fafb', position: 'relative' }}>
                <button 
                  type="button"
                  onClick={() => eliminarDelHistorial(item.id)} 
                  style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer' }}
                >
                  ✕
                </button>
                <span style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '2px' }}>{item.fecha}</span>
                <strong style={{ fontSize: '13px', color: '#111827', display: 'block', width: '90%', wordBreak: 'break-word' }}>{item.vehiculo}</strong>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px' }}>
                  <span style={{ color: '#dc2626' }}>Tasación: <strong>{item.tasacion}€</strong></span>
                  <span style={{ color: '#1e3a8a' }}>B2B: <strong>{item.b2b}€</strong></span>
                  <span style={{ color: '#4b5563' }}>PVP Medio: <strong>{item.medio}€</strong></span>
                </div>
                
                {item.feedback !== 'Sin ajustar' && (
                  <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '9px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Marcado como: {item.feedback}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
