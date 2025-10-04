import React from 'react';

const DashboardSimple = ({ api }) => {
  const handleTest = async () => {
    console.log('API:', api);
    try {
      const result = await api.generateTestData('medium');
      console.log('Result:', result);
      alert('Datos generados correctamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sistema de Distribucion</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Prueba Simple</h2>

          <button
            onClick={handleTest}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Generar Datos de Prueba
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;
