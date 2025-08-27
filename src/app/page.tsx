export default function Home() {
  return (
    <main style={{ 
      fontFamily: 'system-ui', 
      padding: '2rem', 
      textAlign: 'center',
      background: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#6b46c1', marginBottom: '1rem' }}>🌟 Cosmikids API</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>API para generación de mandalas astrológicos</p>
      
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>📋 Endpoints disponibles:</h2>
        <ul style={{ 
          textAlign: 'left', 
          listStyle: 'none', 
          padding: 0, 
          color: '#555' 
        }}>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <code style={{ background: '#f8f8f8', padding: '0.2rem 0.4rem' }}>/api/health</code> - Estado del sistema
          </li>
          <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
            <code style={{ background: '#f8f8f8', padding: '0.2rem 0.4rem' }}>/api/generate-pdf-layered</code> - Generar mandala
          </li>
          <li style={{ padding: '0.5rem 0' }}>
            <code style={{ background: '#f8f8f8', padding: '0.2rem 0.4rem' }}>/api/process-shopify-orders</code> - Procesar pedidos
          </li>
        </ul>
      </div>
      
      <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '2rem' }}>
        API Version: 1.0.0 | Status: Running ✅
      </p>
    </main>
  )
}