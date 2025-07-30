import authService from '../../services/authService';
import { mockApiResponses, mockLocalStorage } from '../../utils/test-utils';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('authService', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  test('login should make correct API call and store token', async () => {
    const loginData = { email: 'test@example.com', password: 'password' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponses.login,
    });

    const response = await authService.login(loginData);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })
    );

    expect(response).toEqual(mockApiResponses.login);
    expect(localStorage.getItem('token')).toBe(mockApiResponses.login.data.token);
  });

  test('register should make correct API call', async () => {
    const registerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password',
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await authService.register(registerData);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/register'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })
    );
  });

  test('logout should clear tokens', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await authService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  test('getCurrentUser should include auth header', async () => {
    const token = 'test-token';
    localStorage.setItem('token', token);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockApiResponses.login.data.user }),
    });

    await authService.getCurrentUser();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${token}`,
        }),
      })
    );
  });

  test('forgotPassword should make correct API call', async () => {
    const email = 'test@example.com';

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await authService.forgotPassword(email);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/forgot-password'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    );
  });

  test('should handle API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    await expect(authService.login({ email: 'test', password: 'test' }))
      .rejects.toThrow();
  });
});