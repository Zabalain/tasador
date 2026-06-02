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
    setQuery(nuevaConsulta); // Actualiza el cuadro de texto
    setData(null);
    ejecutarTasacion(nuevaConsulta); // Recalcula inmediatamente con el dato extra
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      {/* Cabecera */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111' }}>
          Tasador <span style={{ color: '#2563eb' }}>Autos del Norte</span>
        </h1>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Mercado real B2B · España</p>
      </div>
      
      {/* Formulario */}
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #eee', marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Vehículo o Listado</label>
        <form onSubmit={handleTasar}>
          <textarea 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ej: Citroen Berlingo 2019 120000km" 
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

      {/* FLUJO DE PREGUNTA INTERACTIVA */}
      {data && data.necesitaAclaracion && (
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #eab308', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', color: '#854d0e', margin: '0 0 12px 0', lineHeight: '1.4' }}>⚠️ {data.pregunta}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => handleSeleccionarOpcion(opcion)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#fef9c3', color: '#713f12', border: '1px solid #fef08a', borderRadius: '8px', fontSize: '13px', textAlign: 'left', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef08a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#fef9c3'}
              >
                {opcion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BLOQUE DE RESULTADOS FINAL (Solo si no necesita aclaración) */}
      {data && !data.necesitaAclaracion && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.8, textTransform: 'uppercase' }}>Precio de Compra</span>
              <div style={{ margin: '14px 0' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{data.precioCompra}</span>
                <span style={{ fontSize: '18px', display: 'block', marginTop: '2px' }}>euros</span>
              </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#fff', color: '#111', padding: '16px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Precio Venta Medio</span>
              <div style={{ margin: '14px 0' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#111' }}>{data.precioVentaMedio}</span>
                <span style={{ fontSize: '18px', display: 'block', marginTop: '2px', color: '#444' }}>euros</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ flex: 1, backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
              <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Más Bajo</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{data.precioMasBajo} €</span>
            </div>
            <div style={{ flex: 1, backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
              <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Rango</span>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>{data.rangoMin}-{data.rangoMax} €</span>
            </div>
            <div style={{ flex: 1, backgroundColor: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: '#888', display: 'block', textTransform: 'uppercase' }}>Rotación</span>
              <span style={{ 
                fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', alignSelf: 'flex-start',
                backgroundColor: data.rotacion === 'ALTA' ? '#dcfce7' : data.rotacion === 'MEDIA' ? '#fef9c3' : '#fee2e2',
                color: data.rotacion === 'ALTA' ? '#15803d' : data.rotacion === 'MEDIA' ? '#a16207' : '#b91c1c',
                marginTop: '4px'
              }}>{data.rotacion}</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '14px', borderRadius: '0 12px 12px 0', fontSize: '14px', color: '#1e40af', lineHeight: '1.5' }}>
            {data.resumen}
          </div>
        </div>
      )}
    </div>
  );
}
