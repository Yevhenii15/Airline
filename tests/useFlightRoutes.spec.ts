/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFlightRoutes } from '../src/modules/useFlightRoutes';
import { makeRequest as originalMakeRequest } from '../src/modules/functions/makeRequest';

const makeRequest = vi.mocked(originalMakeRequest);

vi.mock('../src/modules/functions/makeRequest', () => ({
  makeRequest: vi.fn(),
}));

vi.mock('../src/modules/auth/useUsers', () => ({
  useUsers: () => ({
    getTokenAndUserId: vi.fn(() => ({
      token: 'fake-token',
      isAdmin: true,
    })),
  }),
}));

describe('useFlightRoutes', () => {
  let fetchRoutes: Function;
  let addRoute: Function;
  let routes: any;
  let loading: any;
  let error: any;

  beforeEach(() => {
    vi.clearAllMocks();
    const flightRoutes = useFlightRoutes();
    fetchRoutes = flightRoutes.fetchRoutes;
    addRoute = flightRoutes.addRoute;
    routes = flightRoutes.routes;
    loading = flightRoutes.loading;
    error = flightRoutes.error;
  });

  it('fetches routes successfully', async () => {
    const mockRoutes = [
      { _id: '1', origin: 'A', destination: 'B' },
      { _id: '2', origin: 'C', destination: 'D' },
    ];
    makeRequest.mockResolvedValue(mockRoutes);
    await fetchRoutes();
    expect(loading.value).toBe(false);
    expect(error.value).toBe(null);
    expect(routes.value).toEqual(mockRoutes);
  });

  it('handles error while fetching routes', async () => {
    makeRequest.mockRejectedValue(new Error('Failed to fetch routes'));
    await fetchRoutes();
    expect(loading.value).toBe(false);
    expect(error.value).toBe('Failed to fetch routes');
    expect(routes.value).toEqual([]);
  });

  it('sets loading state to true while fetching routes', async () => {
    makeRequest.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
    );
    const promise = fetchRoutes();
    expect(loading.value).toBe(true);
    await promise;
    expect(loading.value).toBe(false);
  });

  it('adds a new route successfully', async () => {
    const newRoute = { origin: 'X', destination: 'Y' };
    const createdRoute = { _id: '123', origin: 'X', destination: 'Y' };
    makeRequest
      .mockResolvedValueOnce(createdRoute)
      .mockResolvedValueOnce([createdRoute]);

    await addRoute(newRoute as any);
    expect(error.value).toBe(null);
    expect(routes.value).toContainEqual(createdRoute);
  });

  it('handles error while adding a new route', async () => {
    makeRequest.mockRejectedValue(new Error('Authentication required'));
    await addRoute({ origin: 'fail', destination: 'fail' } as any);
    expect(loading.value).toBe(false);
    expect(error.value).toBe('Authentication required');
    expect(routes.value).toEqual([]);
  });
});
