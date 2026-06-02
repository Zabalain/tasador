'use client';
import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTasar = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/tasar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResult(data.result || data.error || 'Error sin respuesta');
    } catch (err) {
      setResult('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🚗 Tasador de Coches IA</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>Escribe la marca, modelo y año para analizar el mercado español.</p>
      
      <form onSubmit={handleTasar} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Ej: Seat Ibiza 2018 TSI 95cv" 
          style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? 'Tasando...' : 'Tasar'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #eee', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
          <strong>Resultado del análisis:</strong>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
