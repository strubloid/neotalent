import { SessionHelper } from '../services/SessionHelper';
import { SessionData } from '../interfaces';

// Mock express-session
jest.mock('express-session');

describe('SessionHelper', () => {
  let mockSession: SessionData;

  beforeEach(() => {
    mockSession = {
      isAuthenticated: false,
      userId: undefined,
      username: undefined,
      nickname: undefined,
      loginTime: undefined
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserSession', () => {
    it('should create user session with user data', () => {
      const mockUser = {
        _id: 'user-123',
        username: 'testuser',
        nickname: 'Test User'
      };
      
      SessionHelper.createUserSession(mockSession, mockUser);
      
      expect(mockSession.isAuthenticated).toBe(true);
      expect(mockSession.userId).toBe('user-123');
      expect(mockSession.username).toBe('testuser');
      expect(mockSession.nickname).toBe('Test User');
      expect(mockSession.loginTime).toBeDefined();
      expect(new Date(mockSession.loginTime!)).toBeInstanceOf(Date);
    });

    it('should handle user with ObjectId _id', () => {
      const mockUser = {
        _id: { toString: () => 'user-456' },
        username: 'testuser2',
        nickname: 'Test User 2'
      };
      
      SessionHelper.createUserSession(mockSession, mockUser);
      
      expect(mockSession.userId).toBe('user-456');
    });
  });

  describe('destroyUserSession', () => {
    it('should destroy user session', () => {
      // Setup authenticated session
      mockSession.isAuthenticated = true;
      mockSession.userId = 'user-123';
      mockSession.username = 'testuser';
      mockSession.nickname = 'Test User';
      mockSession.loginTime = new Date().toISOString();
      
      SessionHelper.destroyUserSession(mockSession);
      
      expect(mockSession.isAuthenticated).toBe(false);
      expect(mockSession.userId).toBeUndefined();
      expect(mockSession.username).toBeUndefined();
      expect(mockSession.nickname).toBeUndefined();
      expect(mockSession.loginTime).toBeUndefined();
    });

    it('should handle already destroyed session', () => {
      SessionHelper.destroyUserSession(mockSession);
      
      expect(mockSession.isAuthenticated).toBe(false);
      expect(mockSession.userId).toBeUndefined();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true for authenticated session', () => {
      mockSession.isAuthenticated = true;
      mockSession.userId = 'user-123';
      
      const result = SessionHelper.isAuthenticated(mockSession);
      
      expect(result).toBe(true);
    });

    it('should return false when isAuthenticated is false', () => {
      mockSession.isAuthenticated = false;
      mockSession.userId = 'user-123';
      
      const result = SessionHelper.isAuthenticated(mockSession);
      
      expect(result).toBe(false);
    });

    it('should return false when userId is missing', () => {
      mockSession.isAuthenticated = true;
      
      const result = SessionHelper.isAuthenticated(mockSession);
      
      expect(result).toBe(false);
    });

    it('should return false for null session', () => {
      const result = SessionHelper.isAuthenticated(null as any);
      
      expect(result).toBe(false);
    });

    it('should return false for undefined session', () => {
      const result = SessionHelper.isAuthenticated(undefined as any);
      
      expect(result).toBe(false);
    });
  });

  describe('getUserFromSession', () => {
    it('should return user info for authenticated session', () => {
      mockSession.isAuthenticated = true;
      mockSession.userId = 'user-123';
      mockSession.username = 'testuser';
      mockSession.nickname = 'Test User';
      
      const userInfo = SessionHelper.getUserFromSession(mockSession);
      
      expect(userInfo).toEqual({
        userId: 'user-123',
        username: 'testuser',
        nickname: 'Test User'
      });
    });

    it('should return null for unauthenticated session', () => {
      const userInfo = SessionHelper.getUserFromSession(mockSession);
      
      expect(userInfo).toBeNull();
    });

    it('should return null when session is missing required data', () => {
      mockSession.isAuthenticated = true;
      // Missing userId
      
      const userInfo = SessionHelper.getUserFromSession(mockSession);
      
      expect(userInfo).toBeNull();
    });

    it('should return null for null session', () => {
      const userInfo = SessionHelper.getUserFromSession(null as any);
      
      expect(userInfo).toBeNull();
    });
  });
});
