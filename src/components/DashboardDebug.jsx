import React, { useState } from 'react';

const DashboardDebug = ({ api }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateAndDistribute = async () => {
    setLoading(true);
    setMessage('Iniciando proceso...');

    try {
      // Paso 1: Limpiar datos
      setMessage('Paso 1: Limpiando datos...');
      await api.clearAllData();

      // Paso 2: Generar datos
      setMessage('Paso 2: Generando datos de prueba...');
      const genResult = await api.generateTestData('medium');
      console.log('Generate result:', genResult);
      setMessage(`Paso 2 OK: ${genResult.data.agentsCount} agentes, ${genResult.data.accountsCount} cuentas`);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Paso 3: Verificar datos guardados
      setMessage('Paso 3: Verificando datos guardados...');
      const agentsResult = await api.getAgents();
      const accountsResult = await api.getAccounts();
      console.log('Agents in DB:', agentsResult);
      console.log('Accounts in DB:', accountsResult);
      setMessage(`Paso 3 OK: ${agentsResult.data.agents.length} agentes, ${accountsResult.data.accounts.length} cuentas en BD`);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Paso 4: Ejecutar distribución
      setMessage('Paso 4: Ejecutando distribución...');
      const distResult = await api.executeDistribution({ updateRankings: true });
      console.log('Distribution result:', distResult);

      if (distResult.success) {
        setMessage(`Paso 4 OK: Distribución exitosa!`);
      } else {
        setMessage(`Paso 4 ERROR: ${distResult.error.message}`);
        console.error('Distribution error:', distResult.error);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Paso 5: Obtener estadísticas
      setMessage('Paso 5: Obteniendo estadísticas...');
      const stats = await api.getStats();
      console.log('Stats:', stats);

      if (stats.success && stats.data.success) {
        setMessage(`COMPLETADO! Ver consola para detalles.`);
      } else {
        setMessage(`Paso 5: No hay distribución disponible`);
      }

    } catch (error) {
      console.error('Error en proceso:', error);
      setMessage(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Dashboard</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <button
            onClick={handleGenerateAndDistribute}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Procesando...' : 'Generar Datos y Distribuir (Con Debug)'}
          </button>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-mono text-sm">{message}</p>
          </div>
        )}

        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Instrucciones:</strong>
            <br />1. Abre la consola del navegador (F12)
            <br />2. Haz clic en el botón
            <br />3. Observa los mensajes paso a paso
            <br />4. Revisa los logs en la consola para ver detalles
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardDebug;
