import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Testar conexão com Supabase
    supabase.from('proposals').select('count').single()
      .then(() => setConnected(true))
      .catch((error) => console.error('Erro ao conectar:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Proposal Builder
        </h1>
        <p className="text-lg text-gray-600">
          {connected ? (
            <span className="text-green-600">✅ Conectado ao Supabase!</span>
          ) : (
            <span className="text-yellow-600">⏳ Conectando...</span>
          )}
        </p>
      </div>
    </div>
  );
}

export default App;