import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const mockSign = jest.fn();
const mockVerify = jest.fn();
const mockComparePassword = jest.fn();
const mockCreateSession = jest.fn();
const mockDestroySession = jest.fn();
const mockValidateSession = jest.fn();

const mockRepo = {
  searchByEmail: jest.fn(),
  searchByTag: jest.fn(),
  checkAdminRole: jest.fn(),
  getUserById: jest.fn()
};

const mockUsersRepository = jest.fn(() => mockRepo);

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: mockSign,
    verify: mockVerify
  }
}));

jest.unstable_mockModule('../../src/repositories/users.repository.js', () => ({
  default: mockUsersRepository
}));

jest.unstable_mockModule('../../src/services/session.service.js', () => ({
  default: {
    createSession: mockCreateSession,
    destroySession: mockDestroySession,
    validateSession: mockValidateSession
  }
}));

jest.unstable_mockModule('../../src/utils/password.js', () => ({
  comparePassword: mockComparePassword
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  userClient: {}
}));

jest.unstable_mockModule('../../src/config/env.js', () => ({
  env: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h'
  }
}));

const { default: authService } = await import('../../src/services/auth.service.js');
const { ApiError } = await import('../../src/utils/apiError.js');

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersRepository.mockImplementation(() => mockRepo);
  });

  test('isEmail returns true for valid email', () => {
    expect(authService.isEmail('user@example.com')).toBe(true);
  });

  test('isEmail returns false for invalid email', () => {
    expect(authService.isEmail('invalid-email')).toBe(false);
  });

  test('generateToken returns signed token', () => {
    mockSign.mockReturnValue('signed-token');

    const token = authService.generateToken({ id: 1, tag: 'neo' });

    expect(token).toBe('signed-token');
    expect(mockSign).toHaveBeenCalledWith(
      { id: 1, tag: 'neo' },
      'test-secret',
      { expiresIn: '1h' }
    );
  });

  test('generateToken throws ApiError when signing fails', () => {
    mockSign.mockImplementation(() => {
      throw new Error('jwt failed');
    });

    expect(() => authService.generateToken({ id: 1 })).toThrow(ApiError);
    expect(() => authService.generateToken({ id: 1 })).toThrow('Error generating token');
  });

  test('verifyToken returns decoded payload', () => {
    mockVerify.mockReturnValue({ id: 10, tag: 'ada' });

    const decoded = authService.verifyToken('token-123');

    expect(decoded).toEqual({ id: 10, tag: 'ada' });
    expect(mockVerify).toHaveBeenCalledWith('token-123', 'test-secret');
  });

  test('verifyToken throws ApiError for invalid token', () => {
    mockVerify.mockImplementation(() => {
      throw new Error('bad token');
    });

    expect(() => authService.verifyToken('invalid')).toThrow(ApiError);
    expect(() => authService.verifyToken('invalid')).toThrow('Invalid or expired token');
  });

  test('validateCredentials throws when id or password missing', async () => {
    await expect(authService.validateCredentials('', 'pwd')).rejects.toThrow(ApiError);
    await expect(authService.validateCredentials('user', '')).rejects.toThrow('ID and password are required');
  });

  test('validateCredentials uses email query and returns data when password is valid', async () => {
    mockRepo.searchByEmail.mockResolvedValue({
      status: 200,
      data: { id: 2, password: 'hash' }
    });
    mockComparePassword.mockResolvedValue(true);

    const result = await authService.validateCredentials('mail@example.com', 'secret');

    expect(mockRepo.searchByEmail).toHaveBeenCalledWith('mail@example.com', 'id, name, tag, lastname, password');
    expect(result.status).toBe(200);
    expect(result.data.id).toBe(2);
  });

  test('validateCredentials uses tag query and returns 401 when password is invalid', async () => {
    mockRepo.searchByTag.mockResolvedValue({
      status: 200,
      data: { id: 3, password: 'hash' }
    });
    mockComparePassword.mockResolvedValue(false);

    const result = await authService.validateCredentials('moysakuma', 'bad-secret');

    expect(mockRepo.searchByTag).toHaveBeenCalledWith('moysakuma', 'id, name, tag, lastname, password');
    expect(result).toEqual({ status: 401, error: 'Invalid credentials' });
  });

  test('login creates session and returns user and token on success', async () => {
    mockRepo.searchByEmail.mockResolvedValue({
      status: 200,
      data: {
        id: 55,
        tag: 'ada',
        name: 'Ada',
        lastname: 'Lovelace',
        password: 'hash',
        profile_photo_tn: 'thumb.webp'
      }
    });
    mockComparePassword.mockResolvedValue(true);
    mockRepo.checkAdminRole.mockResolvedValue({ status: 200, data: { isAdmin: true } });
    mockSign.mockReturnValue('jwt-token');
    mockCreateSession.mockResolvedValue({ userId: 55, isAdmin: true });

    const req = { session: {} };
    const result = await authService.login('ada@example.com', 'secret', req);

    expect(result.status).toBe(200);
    expect(result.token).toBe('jwt-token');
    expect(result.user).toEqual({
      id: 55,
      tag: 'ada',
      role: 'admin',
      name: 'Ada',
      lastname: 'Lovelace',
      thumbnail: 'thumb.webp'
    });
    expect(mockCreateSession).toHaveBeenCalledWith(req, { id: 55, isAdmin: true });
  });

  test('login throws ApiError when user is not found', async () => {
    mockRepo.searchByTag.mockResolvedValue({ status: 404, error: 'User not found' });

    await expect(authService.login('unknownUser', 'secret', { session: {} })).rejects.toThrow('User not found');
  });

  test('checkAuth returns authenticated payload with admin role', async () => {
    mockValidateSession.mockReturnValue({ isValid: true, userId: 9, isAdmin: false });
    mockRepo.getUserById.mockResolvedValue({ status: 200, data: [{ id: 9, tag: 'traveler' }] });
    mockRepo.checkAdminRole.mockResolvedValue({ status: 200, data: { isAdmin: true } });

    const result = await authService.checkAuth({ session: { userId: 9 } });

    expect(result).toEqual({
      isAuthenticated: true,
      userId: 9,
      id: 9,
      tag: 'traveler',
      role: 'admin',
      isAdmin: true
    });
  });

  test('checkAuth throws when no authenticated user exists', async () => {
    mockValidateSession.mockReturnValue({ isValid: false, userId: null, isAdmin: false });

    await expect(authService.checkAuth({})).rejects.toThrow('User not authenticated');
  });

  test('logout delegates to destroySession', async () => {
    mockDestroySession.mockResolvedValue();

    const req = { session: {} };
    const res = { clearCookie: jest.fn() };
    await authService.logout(req, res);

    expect(mockDestroySession).toHaveBeenCalledWith(req, res);
  });

  test('logout wraps destroy errors in ApiError', async () => {
    mockDestroySession.mockRejectedValue(new Error('session destroy fail'));

    await expect(authService.logout({ session: {} }, {})).rejects.toThrow('Error logging out');
  });
});
