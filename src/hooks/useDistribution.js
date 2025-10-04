import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gestión de distribución
 * Cumple con Single Responsibility Principle (SRP)
 */
export const useDistribution = (api) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);

  const executeDistribution = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.executeDistribution(params);

      if (result.success) {
        await loadStats();
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.getStats();

      if (result.success && result.data.success) {
        setStats(result.data);
      } else {
        setStats(null);
      }
    } catch (err) {
      setError(err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadAgents = useCallback(async () => {
    try {
      const result = await api.getAgents();

      if (result.success) {
        setAgents(result.data.agents);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [api]);

  const executeRotation = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.executeRotation(params);

      if (result.success) {
        await loadStats();
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  const generateData = useCallback(async (preset = 'medium') => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.generateTestData(preset);

      if (result.success) {
        await loadAgents();
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, loadAgents]);

  const clearData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await api.clearAllData();

      if (result.success) {
        setStats(null);
        setAgents([]);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    loading,
    error,
    stats,
    agents,
    executeDistribution,
    executeRotation,
    loadStats,
    loadAgents,
    generateData,
    clearData
  };
};
