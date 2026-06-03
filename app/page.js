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
      
      {/* Cabecera */}
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#111' }}>
          Tasador <span style={{ color: '#2563eb' }}>Autos del Norte</span>
        </h1>
        <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.4' }}>
          Mercado real B2B · España <br />
          <span style={{ fontSize: '11px', color: '#888', fontWeight: '500', display: 'block', marginTop: '2px' }}>
            (Cruce de datos y búsquedas en portales de VO profesionales)
          </span>
        </p>
      </div>
      
      {/* Formulario */}
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee', marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
          INTRODUZCA VEHICULO O LISTADO
        </label>
        <form onSubmit={handleTasar}>
          <textarea 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ej: Dacia Lodgy 2013 161000 1.5DCI" 
            rows={2}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', marginBottom: '12px' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#e2e8f0' : '#2563eb', color: loading ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {loading ? '🔄 Analizando mercado...' : 'REALIZAR TASACION'}
          </button>
        </form>
      </div>

      {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}

      {/* Preguntas interactivas */}
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

      {/* RESULTADOS MOSTRANDO LAS CLAVES CORRECTAS */}
      {data && !data.necesitaAclaracion && (
        <div>
          {/* Fila Bloque Superior - ROJO para la Tasación Ajustada */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, backgroundColor: '#dc2626', color: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.9, textTransform: 'uppercase' }}>PRECIO TASACIÓN (Particular)</span>
              <div style={{ margin: '14px 0 0 0' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.precioTasacion}€</span>
              </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#fff', color: '#111', padding: '16px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>PRECIO VENTA VO MEDIO</span>
              <div style={{ margin: '14px 0 0 0' }}>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>{data.precioVentaMedio}€</span>
              </div>
            </div>
          </div>

          {/* Bloque Profesional Reventa Mayorista B2B */}
          <div style={{ backgroundColor: '#1e3a8a', color: '#fff', padding: '14px 16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.9, display: 'block' }}>PRECIO REVENTA A COMPRAVENTAS (B2B)</span>
              <span style={{ fontSize: '12px', opacity: 0.75 }}>Tu valor de salida rápido en red mayorista</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.precioB2B}€</span>
          </div>

          {/* Fila secundaria: Suelo, Horizonte y Rotación */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <div style={{ flex: 1.1, backgroundColor: '#fff', padding: '12px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
              <span style={{ fontSize: '10px', color: '#e11d48', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>SUELO MERCADO</span>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', display: 'block' }}>{data.precioMasBajo} €</span>
              <span style={{ fontSize: '9px', color: '#777', display: 'block', marginTop: '4px', lineHeight: '1.2' }}>Anuncio más económico en portales.</span>
            </div>

            <div style={{ flex: 1.2, backgroundColor: '#fff', padding: '12px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
              <span style={{ fontSize: '10px', color: '#4b5563', display: 'block', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>HORIZONTE VO</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333', display: 'block' }}>{data.rangoMin}-{data.rangoMax} €</span>
              <span style={{ fontSize: '9px', color: '#777', display: 'block', marginTop: '4px', lineHeight: '1.2' }}>Rango habitual de venta público.</span>
            </div>

            <div style={{ flex: 0.9, backgroundColor: estilosRotacion.backgroundColor, padding: '12px 10px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: estilosRotacion.labelColor, fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.9 }}>ROTACIÓN</span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: estilosRotacion.color, marginTop: '2px' }}>{data.rotacion}</span>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px', borderRadius: '0 12px 12px 0', fontSize: '14px', color: '#1e40af', lineHeight: '1.5', marginBottom: '20px' }}>
            {data.resumen}
          </div>

          {/* Botón Realizar otra tasación */}
          <button
            onClick={handleNuevaTasacion}
            style={{ width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            🔄 REALIZAR OTRA TASACION
          </button>
        </div>
      )}
    </div>
  );
}
