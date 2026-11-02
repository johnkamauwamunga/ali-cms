import initialData from '../data/data.json';
import { readSavedPortfolio } from './storageService';
import { mockApi } from './mockApi';

export async function getPortfolioData() {
  const saved = readSavedPortfolio();
  if (!saved) return mockApi.get(structuredClone(initialData));
  return mockApi.get({
    ...structuredClone(initialData),
    ...saved,
    profile: { ...initialData.profile, ...saved.profile },
    navigation: { ...initialData.navigation, ...saved.navigation },
    settings: { ...initialData.settings, ...saved.settings, sectionVisibility: { ...initialData.settings.sectionVisibility, ...saved.settings?.sectionVisibility } },
    cvSettings: { ...initialData.cvSettings, ...saved.cvSettings, selectedIds: { ...initialData.cvSettings.selectedIds, ...saved.cvSettings?.selectedIds } },
    authSettings: { ...initialData.authSettings, ...saved.authSettings },
    references: saved.references ?? initialData.references,
    authCredentials: saved.authCredentials ?? null,
  });
}

export async function getCollection(name, portfolio) {
  return mockApi.get(portfolio[name] ?? []);
}

export function getInitialPortfolio() {
  return structuredClone(initialData);
}

export function createRecord(record) {
  const timestamp = new Date().toISOString();
  return mockApi.create({
    ...record,
    id: record.id || globalThis.crypto?.randomUUID?.() || `record-${Date.now()}`,
    published: Boolean(record.published),
    sortOrder: Number(record.sortOrder ?? 0),
    createdAt: record.createdAt || timestamp,
    updatedAt: timestamp,
  });
}

export function updateRecord(record) {
  return mockApi.update({ ...record, updatedAt: new Date().toISOString() });
}

export const deleteRecord = (id) => mockApi.delete(id);

export { initialData };
