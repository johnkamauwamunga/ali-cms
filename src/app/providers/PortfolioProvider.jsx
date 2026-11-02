import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  createRecord as createMockRecord,
  deleteRecord as deleteMockRecord,
  getInitialPortfolio,
  getPortfolioData,
  updateRecord as updateMockRecord,
} from '../../services/portfolioService';
import { savePortfolio } from '../../services/storageService';

export const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getPortfolioData()
      .then((data) => {
        if (active) setPortfolio(data);
      })
      .catch((error) => {
        console.error('Unable to load portfolio data.', error);
        toast.error('Portfolio data could not be loaded.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!portfolio) return;
    try {
      savePortfolio(portfolio);
    } catch (error) {
      toast.error(error.message || 'Your changes could not be saved.');
    }
  }, [portfolio]);

  useEffect(() => {
    if (!portfolio) return undefined;
    const theme = portfolio.settings.theme;
    const accentColor = portfolio.settings.accentColor;
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      root.dataset.theme = theme === 'system'
        ? (media.matches ? 'dark' : 'light')
        : theme;
      root.style.setProperty('--primary', accentColor || '#c45d3a');
    };
    applyTheme();
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [portfolio?.settings?.theme, portfolio?.settings?.accentColor]);

  useEffect(() => {
    if (!portfolio) return;
    document.title = portfolio.settings.websiteTitle || `${portfolio.profile.fullName} — Portfolio`;
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.append(description);
    }
    description.content = portfolio.settings.websiteDescription || '';
  }, [portfolio?.settings?.websiteTitle, portfolio?.settings?.websiteDescription, portfolio?.profile?.fullName]);

  const updateProfile = useCallback(async (profile) => {
    setPortfolio((current) => ({ ...current, profile: { ...current.profile, ...profile } }));
  }, []);

  const updateSection = useCallback((section, patch) => {
    setPortfolio((current) => ({ ...current, [section]: { ...current[section], ...patch } }));
  }, []);

  const updateSettings = useCallback((patch) => {
    setPortfolio((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  }, []);

  const create = useCallback(async (collection, values) => {
    const record = await createMockRecord(values);
    setPortfolio((current) => ({
      ...current,
      [collection]: [...(current[collection] || []), { ...record, sortOrder: current[collection]?.length || 0 }],
    }));
    return record;
  }, []);

  const update = useCallback(async (collection, id, values) => {
    const record = await updateMockRecord({ ...values, id });
    setPortfolio((current) => ({
      ...current,
      [collection]: current[collection].map((item) => item.id === id ? { ...item, ...record } : item),
    }));
    return record;
  }, []);

  const remove = useCallback(async (collection, id) => {
    await deleteMockRecord(id);
    setPortfolio((current) => ({
      ...current,
      [collection]: current[collection].filter((item) => item.id !== id),
    }));
  }, []);

  const reorder = useCallback((collection, id, direction) => {
    setPortfolio((current) => {
      const entries = [...current[collection]];
      const index = entries.findIndex((entry) => entry.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= entries.length) return current;
      [entries[index], entries[target]] = [entries[target], entries[index]];
      return { ...current, [collection]: entries.map((entry, sortOrder) => ({ ...entry, sortOrder })) };
    });
  }, []);

  const reset = useCallback(() => setPortfolio(getInitialPortfolio()), []);

  const value = useMemo(() => ({
    portfolio, loading, updateProfile, updateSection, updateSettings, create, update, remove, reorder, reset,
  }), [portfolio, loading, updateProfile, updateSection, updateSettings, create, update, remove, reorder, reset]);

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}
