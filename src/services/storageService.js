const STORAGE_KEY = 'portfolio-cms-data';

export function readSavedPortfolio() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Unable to read saved portfolio data.', error);
    return null;
  }
}

export function savePortfolio(portfolio) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Unable to persist portfolio data.', error);
    throw new Error('Your changes could not be saved in this browser.');
  }
}

export function clearSavedPortfolio() {
  localStorage.removeItem(STORAGE_KEY);
}
