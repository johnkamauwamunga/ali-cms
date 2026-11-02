const pause = (value) => new Promise((resolve) => window.setTimeout(() => resolve(value), 120));

export const mockApi = {
  get: (value) => pause(value),
  create: (record) => pause(record),
  update: (record) => pause(record),
  delete: (id) => pause(id),
};
