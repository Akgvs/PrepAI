import { useState, useEffect, useCallback } from 'react';
import usageService from '../services/usage.service.js';

/**
 * Custom hook to track user usage against monthly plan limits.
 */
export const useUsageQuota = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usageService.get();
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const getQuotaFor = (field) => {
    const current = data?.usage?.[field] || 0;
    const rawLimit = data?.limits?.[field];
    const isUnlimited =
      data?.isUnlimited ||
      data?.plan === 'paid' ||
      rawLimit === null ||
      rawLimit === undefined ||
      rawLimit === Infinity;

    const limit = isUnlimited ? 'Unlimited' : (rawLimit ?? 5);
    const remaining = isUnlimited ? 'Unlimited' : Math.max(0, limit - current);
    const isExceeded = !isUnlimited && current >= limit;

    return {
      current,
      limit,
      remaining,
      isExceeded,
      isUnlimited,
    };
  };

  const updatePlan = async (newPlan) => {
    const res = await usageService.updatePlan(newPlan);
    await fetchUsage();
    return res.data;
  };

  return {
    usageData: data,
    plan: data?.plan || 'free',
    isPaid: data?.plan === 'paid' || data?.isUnlimited,
    loading,
    error,
    refreshUsage: fetchUsage,
    updatePlan,
    getQuotaFor,
  };
};

export default useUsageQuota;
