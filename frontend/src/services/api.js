const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${response.status}: ${text}`);
  }
  return response.json();
}

function buildUrl(path) {
  return `${API_BASE}${path}`;
}

export const api = {
  // Health check
  health: () =>
    fetch(buildUrl('/health')).then(handleResponse),

  // Trips
  createTrip: (data) =>
    fetch(buildUrl('/trips'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getTrip: (tripId) =>
    fetch(buildUrl(`/trips/${tripId}`)).then(handleResponse),

  // Itinerary
  getItinerary: (tripId) =>
    fetch(buildUrl(`/trips/${tripId}/itinerary`)).then(handleResponse),

  // Events
  getEvents: (tripId) =>
    fetch(buildUrl(`/trips/${tripId}/events`)).then(handleResponse),

  // Disruptions
  simulateDisruption: (tripId, data) =>
    fetch(buildUrl(`/trips/${tripId}/disruptions`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Replan
  replan: (tripId) =>
    fetch(buildUrl(`/trips/${tripId}/replan`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(handleResponse),

  // Chat
  chat: (data) =>
    fetch(buildUrl('/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Activities
  getActivities: () =>
    fetch(buildUrl('/activities')).then(handleResponse),
};
