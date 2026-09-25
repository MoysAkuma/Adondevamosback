import { describe, test, expect, jest } from '@jest/globals';

const { default: sessionService } = await import('../../src/services/session.service.js');

describe('session.service', () => {
  test('createSession rejects when session middleware is missing', async () => {
    await expect(sessionService.createSession({}, { id: 1, isAdmin: false })).rejects.toThrow('Session middleware is not configured');
  });

  test('createSession persists and returns session data', async () => {
    const req = {
      session: {
        save: jest.fn((cb) => cb(null))
      }
    };

    const result = await sessionService.createSession(req, { id: 5, isAdmin: true });

    expect(req.session.userId).toBe(5);
    expect(req.session.isAdmin).toBe(true);
    expect(typeof req.session.loginTime).toBe('string');
    expect(result.userId).toBe(5);
    expect(result.isAdmin).toBe(true);
  });

  test('destroySession rejects when no session exists', async () => {
    await expect(sessionService.destroySession({}, { clearCookie: jest.fn() })).rejects.toThrow('No session found');
  });

  test('destroySession clears cookie and resolves', async () => {
    const req = {
      session: {
        destroy: jest.fn((cb) => cb(null))
      }
    };
    const res = { clearCookie: jest.fn() };

    await sessionService.destroySession(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith('sessionId');
  });

  test('validateSession returns invalid payload when missing userId', () => {
    const result = sessionService.validateSession({ session: {} });

    expect(result).toEqual({ isValid: false, userId: null });
  });

  test('validateSession returns valid payload when session has userId', () => {
    const result = sessionService.validateSession({
      session: { userId: 3, isAdmin: false, loginTime: '2026-01-01T00:00:00.000Z' }
    });

    expect(result).toEqual({
      isValid: true,
      userId: 3,
      isAdmin: false,
      loginTime: '2026-01-01T00:00:00.000Z'
    });
  });

  test('getSessionData returns null when not logged in', () => {
    expect(sessionService.getSessionData({ session: {} })).toBeNull();
  });

  test('getSessionData returns session details when logged in', () => {
    expect(sessionService.getSessionData({
      session: { userId: 22, isAdmin: true, loginTime: 'x' }
    })).toEqual({ userId: 22, isAdmin: true, loginTime: 'x' });
  });

  test('updateSession merges updates and saves', async () => {
    const req = {
      session: {
        userId: 50,
        isAdmin: false,
        save: jest.fn((cb) => cb(null))
      }
    };

    const result = await sessionService.updateSession(req, { isAdmin: true, custom: 'ok' });

    expect(result.isAdmin).toBe(true);
    expect(result.custom).toBe('ok');
  });
});
