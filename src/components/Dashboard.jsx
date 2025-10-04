import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = ({ api }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [config, setConfig] = useState({
    totalAccounts: 1000,
    totalAgents: 10,
    preset: 'medium'
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await api.getStats();
      console.log('Stats result from API:', result);

      if (result.success && result.data) {
        console.log('Setting stats:', result.data);
        setStats(result.data);
      } else {
        console.log('No stats available or failed:', result);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.clearAllData();
      const result = await api.generateTestData(config.preset);
      setMessage({
        type: 'success',
        text: `Datos generados: ${result.data.agentsCount} agentes, ${result.data.accountsCount} cuentas`
      });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error generating data:', error);
      setMessage({
        type: 'error',
        text: 'Error al generar datos: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteDistribution = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await api.executeDistribution({ updateRankings: true });
      console.log('Distribution result:', result);
      await loadStats();

      if (result && result.success && result.data) {
        setMessage({
          type: 'success',
          text: `Distribución completada exitosamente`
        });
      } else {
        setMessage({
          type: 'success',
          text: 'Distribución ejecutada. Ver resultados en la tabla.'
        });
      }
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error executing distribution:', error);
      setMessage({
        type: 'error',
        text: 'Error al ejecutar distribución: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRotation = async () => {
    setLoading(true);
    try {
      await api.executeRotation({ rotationType: 'partial', percentage: 0.2 });
      await loadStats();
    } catch (error) {
      console.error('Error executing rotation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getChartData = () => {
    if (!stats || !stats.stats) return [];

    return stats.stats.map(item => ({
      name: item.agentName.split(' ')[0],
      ranking: item.ranking,
      equitativas: item.equitableAccounts,
      porRanking: item.rankingAccounts,
      total: item.totalAccounts
    }));
  };

  const presets = [
    { value: 'small', label: 'Pequeño (5 agentes, 100 cuentas)' },
    { value: 'medium', label: 'Mediano (10 agentes, 1000 cuentas)' },
    { value: 'large', label: 'Grande (25 agentes, 5000 cuentas)' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(247, 147, 26, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 212, 170, 0.08) 0%, transparent 50%)'
        }}></div>
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{
          background: 'radial-gradient(circle, #f7931a 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{
          background: 'radial-gradient(circle, #00d4aa 0%, transparent 70%)',
          animation: 'float 25s ease-in-out infinite reverse'
        }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
          animation: 'float 30s ease-in-out infinite',
          transform: 'translate(-50%, -50%)'
        }}></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(247, 147, 26, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(247, 147, 26, 0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header con diseño crypto/trading */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative crypto-glow" style={{
              background: 'linear-gradient(135deg, #f7931a 0%, #e67e00 100%)',
              boxShadow: '0 8px 32px rgba(247, 147, 26, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
            }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1" style={{
                
                WebkitBackgroundClip: 'text',
           
                backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
              }}>
                Sistema de Distribución Híbrida
              </h1>
            </div>
          </div>
          <div className="h-1 w-full rounded-full relative overflow-hidden" style={{
            background: 'linear-gradient(90deg, #f7931a 0%, #00d4aa 50%, #8b5cf6 100%)',
            boxShadow: '0 0 20px rgba(247, 147, 26, 0.5)'
          }}>
            <div className="shimmer absolute inset-0"></div>
          </div>
        </header>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 backdrop-filter backdrop-blur-md ${
            message.type === 'success'
              ? 'border-l-green-400'
              : 'border-l-red-400'
          }`} style={{
            background: message.type === 'success'
              ? 'linear-gradient(135deg, rgba(0, 212, 170, 0.15) 0%, rgba(0, 168, 132, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
            boxShadow: message.type === 'success'
              ? '0 4px 16px rgba(0, 212, 170, 0.2), 0 0 0 1px rgba(0, 212, 170, 0.1)'
              : '0 4px 16px rgba(239, 68, 68, 0.2), 0 0 0 1px rgba(239, 68, 68, 0.1)',
            borderLeft: message.type === 'success' ? '4px solid #00d4aa' : '4px solid #ef4444'
          }}>
            <p className={`font-semibold flex items-center gap-2 ${
              message.type === 'success' ? 'text-green-300' : 'text-red-300'
            }`}>
              {message.type === 'success' ? '✓' : '✗'} {message.text}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #f7931a 0%, #e67e00 100%)'
              }}>
                <div className="w-4 h-4 rounded border-2 border-white"></div>
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#f7931a' }}>
                Configuración
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#9ca3af' }}>
                  Tamaño del Dataset
                </label>
                <select
                  value={config.preset}
                  onChange={(e) => setConfig({ ...config, preset: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300"
                  style={{
                    background: 'rgba(10, 14, 39, 0.6)',
                    border: '1px solid rgba(247, 147, 26, 0.3)',
                    color: '#e5e7eb',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f7931a'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(247, 147, 26, 0.3)'}
                  disabled={loading}
                >
                  {presets.map(preset => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateData}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Generando...' : 'Generar Datos de Prueba'}
              </button>
            </div>
          </div>

          <div className="card relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #00d4aa 0%, #00a884 100%)'
              }}>
                <div className="w-4 h-1 rounded bg-white"></div>
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#00d4aa' }}>
                Acciones
              </h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExecuteDistribution}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                Ejecutar Distribucion
              </button>

              <button
                onClick={handleExecuteRotation}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                Ejecutar Rotacion (20%)
              </button>

              <button
                onClick={loadStats}
                disabled={loading}
                className="btn btn-outline w-full"
              >
                Actualizar Estadisticas
              </button>
            </div>
          </div>

          <div className="card relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
              }}>
                <div className="w-4 h-4 rounded-sm border-2 border-white"></div>
              </div>
              <h3 className="text-lg font-bold" style={{ color: '#8b5cf6' }}>
                Resumen
              </h3>
            </div>

            {stats && stats.summary ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl backdrop-filter backdrop-blur-sm" style={{
                  background: 'linear-gradient(135deg, rgba(247, 147, 26, 0.15) 0%, rgba(247, 147, 26, 0.05) 100%)',
                  border: '1px solid rgba(247, 147, 26, 0.3)'
                }}>
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Total Cuentas:</span>
                  <span className="font-bold text-lg" style={{ color: '#f7931a' }}>{stats.summary.totalAccounts}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl backdrop-filter backdrop-blur-sm" style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.15) 0%, rgba(0, 212, 170, 0.05) 100%)',
                  border: '1px solid rgba(0, 212, 170, 0.3)'
                }}>
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Promedio:</span>
                  <span className="font-bold text-lg" style={{ color: '#00d4aa' }}>{stats.summary.avgAccounts}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl backdrop-filter backdrop-blur-sm" style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}>
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Desv. Estándar:</span>
                  <span className="font-bold text-lg" style={{ color: '#8b5cf6' }}>{stats.summary.stdDeviation}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl backdrop-filter backdrop-blur-sm" style={{
                  background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.15) 0%, rgba(156, 163, 175, 0.05) 100%)',
                  border: '1px solid rgba(156, 163, 175, 0.3)'
                }}>
                  <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>Rango:</span>
                  <span className="font-bold text-lg" style={{ color: '#e5e7eb' }}>
                    {stats.summary.minAccounts} - {stats.summary.maxAccounts}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: '#6b7280' }}>
                No hay distribucion activa. Genera datos y ejecuta una distribucion.
              </p>
            )}
          </div>
        </div>

        {stats && stats.stats && (
          <>
            <div className="card mb-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #f7931a 0%, #e67e00 100%)'
                }}>
                  <div className="w-5 h-5 rounded border-2 border-white"></div>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#f7931a' }}>
                  Distribucion de Cuentas por Agente
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={getChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(247, 147, 26, 0.1)" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px', fontWeight: '600' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(19, 24, 66, 0.95)',
                      border: '1px solid rgba(247, 147, 26, 0.3)',
                      borderRadius: '12px',
                      color: '#e5e7eb',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(10px)'
                    }}
                    labelStyle={{ color: '#f7931a', fontWeight: 'bold', marginBottom: '8px' }}
                  />
                  <Legend
                    wrapperStyle={{ color: '#e5e7eb', fontWeight: '600' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="equitativas"
                    stackId="a"
                    fill="url(#colorEquitativas)"
                    name="Cuentas Equitativas"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="porRanking"
                    stackId="a"
                    fill="url(#colorRanking)"
                    name="Cuentas por Ranking"
                    radius={[8, 8, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="colorEquitativas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f7931a" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#e67e00" stopOpacity={0.8}/>
                    </linearGradient>
                    <linearGradient id="colorRanking" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#00a884" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #00d4aa 0%, #00a884 100%)'
                }}>
                  <div className="w-5 h-1 rounded bg-white mb-1"></div>
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#00d4aa' }}>
                  Tabla de Distribucion
                </h3>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ranking</th>
                      <th>Agente</th>
                      <th>Equitativas</th>
                      <th>Por Ranking</th>
                      <th>Total</th>
                      <th>Conversion</th>
                      <th>Rendimientos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.stats.map((item, index) => (
                      <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                        <td>
                          <span className={`badge ${
                            index === 0 ? 'badge-warning' :
                            index === 1 ? 'badge-info' :
                            index === 2 ? 'badge-success' : 'badge-info'
                          }`}>
                            #{item.ranking}
                          </span>
                        </td>
                        <td className="font-medium">{item.agentName}</td>
                        <td>{item.equitableAccounts}</td>
                        <td>{item.rankingAccounts}</td>
                        <td className="font-semibold">{item.totalAccounts}</td>
                        <td>{item.metrics?.conversionRate ? item.metrics.conversionRate.toFixed(2) + '%' : 'N/A'}</td>
                        <td>{item.metrics?.totalSales ? '$' + item.metrics.totalSales.toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(10, 14, 39, 0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="rounded-2xl p-8 shadow-2xl relative crypto-glow" style={{
              background: 'linear-gradient(135deg, rgba(19, 24, 66, 0.95) 0%, rgba(26, 31, 58, 0.95) 100%)',
              border: '2px solid rgba(247, 147, 26, 0.5)',
              boxShadow: '0 8px 64px rgba(247, 147, 26, 0.4), inset 0 0 40px rgba(247, 147, 26, 0.1)'
            }}>
              <div className="animate-spin rounded-full h-16 w-16 mx-auto mb-4" style={{
                border: '4px solid rgba(247, 147, 26, 0.2)',
                borderTopColor: '#f7931a',
                boxShadow: '0 0 20px rgba(247, 147, 26, 0.5)'
              }}></div>
              <p className="font-bold text-lg text-center" style={{
                color: '#f7931a',
                textShadow: '0 0 20px rgba(247, 147, 26, 0.5)'
              }}>
                Procesando...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
