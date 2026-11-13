const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '');

export async function apiGet(path) {
  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const responseText = await response.text();
  let body;

  try {
    body = responseText ? JSON.parse(responseText) : null;
  } catch {
    throw new Error(`The API returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    const error = new Error(body?.message || `The API request failed (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }

  if (!body?.success || !Object.hasOwn(body, 'data')) {
    throw new Error(body?.message || 'The API returned an unexpected response.');
  }

  return body.data;
}

export const getProjects = () => apiGet('/projects');
export const getProject = (slug) => apiGet(`/projects/${encodeURIComponent(slug)}`);
