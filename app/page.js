'use client';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ejecutarTasacion = async (consultaAEnviar) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/tasar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: consultaAEnviar })
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleTasar = (e) => {
    e.preventDefault();
    if (!query) return;
    setData(null);
    ejecutarTasacion(query);
  };

  const handleSeleccionarOpcion = (opcion) => {
    const nuevaConsulta = `${query} (${opcion})`;
    setQuery(nuevaConsulta);
    setData(null);
    ejecutarTasacion(nuevaConsulta);
  };

  const handleNuevaTasacion = () => {
    setQuery('');
    setData(null);
    setError('');
  };

  // Lógica de colores completa para la tarjeta de rotación
  const obtenerEstilosRotacion = (rotacion) => {
    switch (rotacion) {
      case 'ALTA':
        return { backgroundColor: '#22c55e', color: '#ffffff', labelColor: '#ffffff' };
      case 'MEDIA':
        return { backgroundColor: '#eab308', color: '#1e1b4b', labelColor: '#451a03' };
      case 'BAJA':
        return { backgroundColor: '#ef4444', color: '#ffffff', labelColor: '#ffffff' };
      default:
        return { backgroundColor: '#fff', color: '#111', labelColor: '#666' };
    }
  };

  const estilosRotacion = data && !data.necesitaAclaracion ? obtenerEstilosRotacion(data.rotacion) : {};

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      {/* Cabecera optimizada con referencia a portales */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111' }}>
          Tasador <span style={{ color: '#2563eb' }}>Autos del Norte</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.4' }}>
          Mercado real B2B · España <br />
          <span style={{ fontSize: '11px', color: '#888', fontWeight: '500' }}>
            (Cruce de datos y búsquedas en portales de VO profesionales)
          </span>
        </p>
      </div>
      
      {/* Formulario */}
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee', marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Vehículo o Listado</label>
        <form onSubmit={handleTasar}>
          <textarea 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ej: Fiat Scudo 2009 130000" 
            rows={2}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', marginBottom: '12px' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#e2e8f0' : '#2563eb', color: loading ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? '🔄 Analizando mercado...' : 'Tasar'}
          </button>
        </form>
      </div>

      {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}

      {/* Flujo de pregunta interactiva */}
      {data && data.necesitaAclaracion && (
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eab308', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: '#854d0e', margin: '0 0 12px 0', lineHeight: '1.4' }}>⚠️ {data.pregunta}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => handleSeleccionarOpcion(opcion)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#fef9c3', color: '#713f12', border: '1px solid #fef08a', borderRadius: '8px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', fontWeight: '500' }}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bloque de resultados final */}
      {data && !data.necesitaAclaracion && (
        <div>
          {/* Fila principal de Precios */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.9, textTransform: 'uppercase' }}>Precio Máx Compra B2B</span>
              <div style={{ margin: '14px 0 0 0' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.precioCompra}€</span>
              </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#fff', color: '#111', padding: '16px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Precio Venta VO Medio</span>
              <div style={{ margin: '14px 0 0 0' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>{data.precioVentaMedio}€</span>
              </div>
            </div>
          </div>

          {/* Fila secundaria: Explicaciones mejoradas y Rotación con color total */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            
            {/* Tarjeta Más Bajo Explicada */}
            <div style={{ flex: 1.1, backgroundColor: '#fff', padding: '12px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
              <span style={{ fontSize: '10px', color: '#e11d48', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>SUELO MERCADO</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', display: 'block' }}>{data.precioMasBajo} €</span>
              <span style={{ fontSize: '9px', color: '#777', display: 'block', marginTop: '4px', lineHeight: '1.2' }}>Anuncio más económico actual en España.</span>
            </div>

            {/* Tarjeta Rango Explicada */}
            <div style={{ flex: 1.2, backgroundColor: '#fff', padding: '12px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
              <span style={{ fontSize: '10px', color: '#4b5563', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>HORIZONTE VO</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'block', whiteSpace: 'nowrap' }}>{data.rangoMin}-{data.rangoMax} €</span>
              <span style={{ fontSize: '9px', color: '#777', display: 'block', marginTop: '4px', lineHeight: '1.2' }}>Precios habituales según estado y garantía.</span>
            </div>

            {/* Tarjeta Rotación TOTALMENTE coloreada */}
            <div style={{ 
              flex: 0.9, 
              backgroundColor: estilosRotacion.backgroundColor, 
              padding: '12px 10px', 
              borderRadius: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.3s'
            }}>
              <span style={{ fontSize: '10px', color: estilosRotacion.labelColor, fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.5px' }}>ROTACIÓN</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: estilosRotacion.color, marginTop: '2px' }}>{data.rotacion}</span>
            </div>

          </div>

          {/* Resumen con alertas mecánicas */}
          <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px', borderRadius: '0 12px 12px 0', fontSize: '14px', color: '#1e40af', lineHeight: '1.5', marginBottom: '20px' }}>
            {data.resumen}
          </div>

          {/* Botón Nueva Tasación */}
          <button
            onClick={handleNuevaTasacion}
            style={{ width: '100%', padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            🔄 Realizar otra tasación
          </button>
        </div>
      )}
    </div>
  );
}
