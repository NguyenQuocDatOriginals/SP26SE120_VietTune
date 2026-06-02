import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types';
import type { User } from '@/types/user';

const mocks = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockGetStoredUser: vi.fn(),
  mockIsAuthenticated: vi.fn(),
  mockLogout: vi.fn(),
  mockProcessPendingProfileUpdates: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/services/authService', () => ({
  authService: {
    getStoredUser: () => mocks.mockGetStoredUser(),
    isAuthenticated: () => mocks.mockIsAuthenticated(),
    login: mocks.mockLogin,
    logout: mocks.mockLogout,
    processPendingProfileUpdates: mocks.mockProcessPendingProfileUpdates,
  },
}));

vi.mock('@/services/storageService', () => ({
  getItem: vi.fn(),
  setItem: vi.fn(() => Promise.resolve()),
  removeItem: vi.fn(() => Promise.resolve()),
}));

function sampleUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    username: 'test',
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.CONTRIBUTOR,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockGetStoredUser.mockReturnValue(null);
    mocks.mockIsAuthenticated.mockReturnValue(false);
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('login sets user on success', async () => {
    const u = sampleUser();
    mocks.mockLogin.mockResolvedValue({
      success: true,
      data: { user: u, token: 'tok' },
    });

    await useAuthStore.getState().login('test@example.com', 'secret');

    expect(useAuthStore.getState().user).toEqual(u);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('login sets error and rethrows on failure', async () => {
    mocks.mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    await expect(
      useAuthStore.getState().login('test@example.com', 'wrong'),
    ).rejects.toThrow('Invalid credentials');

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().error).toBe('Invalid credentials');
  });

  it('logout clears user and calls authService.logout', () => {
    useAuthStore.setState({ user: sampleUser(), isAuthenticated: true });

    useAuthStore.getState().logout();

    expect(mocks.mockLogout).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('fetchCurrentUser skips when not authenticated', async () => {
    mocks.mockIsAuthenticated.mockReturnValue(false);

    await useAuthStore.getState().fetchCurrentUser();

    expect(mocks.mockGetStoredUser).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('fetchCurrentUser hydrates user from storage when authenticated', async () => {
    const u = sampleUser({ id: 'u2' });
    mocks.mockIsAuthenticated.mockReturnValue(true);
    mocks.mockGetStoredUser.mockReturnValue(u);

    await useAuthStore.getState().fetchCurrentUser();

    expect(useAuthStore.getState().user).toEqual(u);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(mocks.mockProcessPendingProfileUpdates).toHaveBeenCalled();
  });

  it('fetchCurrentUser clears user when authenticated but storage is empty', async () => {
    mocks.mockIsAuthenticated.mockReturnValue(true);
    mocks.mockGetStoredUser.mockReturnValue(null);

    await useAuthStore.getState().fetchCurrentUser();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mocks.mockProcessPendingProfileUpdates).not.toHaveBeenCalled();
  });

  it('clearError clears error', () => {
    useAuthStore.setState({ error: 'x' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
