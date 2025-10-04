import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import { container } from './infrastructure/DependencyContainer';
import { DistributionAPI } from './presentation/api/DistributionAPI';

const App = () => {
  const [api, setApi] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Inicializando sistema...');
        await container.initialize();
        console.log('Sistema inicializado');

        const distributionAPI = new DistributionAPI(container);
        console.log('API initialized:', distributionAPI);
        setApi(distributionAPI);
      } catch (err) {
        console.error('Error initializing API:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <h2 className="text-red-900 font-bold mb-2">Error de Inicializacion</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !api) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-900 font-medium mb-2">Inicializando sistema...</p>
          <p className="text-gray-600 text-sm">Preparando conexión con base de datos</p>
        </div>
      </div>
    );
  }

  return <Dashboard api={api} />;
};

export default App;
