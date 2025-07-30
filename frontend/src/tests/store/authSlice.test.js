import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  login, 
  logout, 
  register, 
  clearError, 
  updateUser 
} from '../../store/slices/authSlice';
import { mockUser, mockApiResponses } from '../../utils/test-utils';

// Mock API calls
jest.mock('../../services/authService', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
}));

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  test('should handle initial state', () => {
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('should handle login pending', () => {
    store.dispatch({ type: login.pending.type });
    const state = store.getState().auth;
    
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('should handle login fulfilled', () => {
    const loginData = mockApiResponses.login.data;
    
    store.dispatch({
      type: login.fulfilled.type,
      payload: loginData,
    });
    
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(loginData.user);
    expect(state.token).toBe(loginData.token);
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  test('should handle login rejected', () => {
    const errorMessage = 'Invalid credentials';
    
    store.dispatch({
      type: login.rejected.type,
      payload: errorMessage,
    });
    
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.isAuthenticated).toBe(false);
  });

  test('should handle logout', () => {
    // First login
    store.dispatch({
      type: login.fulfilled.type,
      payload: mockApiResponses.login.data,
    });
    
    // Then logout
    store.dispatch({ type: logout.fulfilled.type });
    
    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.loading).toBe(false);
  });

  test('should handle register fulfilled', () => {
    store.dispatch({ type: register.fulfilled.type });
    
    const state = store.getState().auth;
    expect(state.loading).toBe(false);
    expect(state.registrationSuccess).toBe(true);
    expect(state.error).toBeNull();
  });

  test('should clear error', () => {
    // Set an error first
    store.dispatch({
      type: login.rejected.type,
      payload: 'Some error',
    });
    
    // Clear the error
    store.dispatch(clearError());
    
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });

  test('should update user', () => {
    // Login first
    store.dispatch({
      type: login.fulfilled.type,
      payload: mockApiResponses.login.data,
    });
    
    // Update user
    const updates = { name: 'Updated Name' };
    store.dispatch(updateUser(updates));
    
    const state = store.getState().auth;
    expect(state.user.name).toBe('Updated Name');
  });
});