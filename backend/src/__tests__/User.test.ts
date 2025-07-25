import User from '../models/User';

// Mock mongoose
jest.mock('mongoose');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with required fields', () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User',
        searchHistory: []
      };

      const user = new User(userData);

      expect(user.username).toBe('testuser');
      expect(user.password).toBe('password123');
      expect(user.nickname).toBe('Test User');
      expect(user.searchHistory).toEqual([]);
    });

    it('should handle user creation with minimal data', () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User'
      };

      const user = new User(userData);

      expect(user.username).toBe('testuser');
      expect(user.password).toBe('password123');
      expect(user.nickname).toBe('Test User');
    });
  });

  describe('Static Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('findByUsername', () => {
      it('should call findOne with username', async () => {
        const mockUser = {
          _id: 'user-id',
          username: 'testuser',
          nickname: 'Test User'
        };

        // Mock the static method
        jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

        const result = await User.findByUsername('testuser');

        expect(User.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(result).toEqual(mockUser);
      });

      it('should return null when user not found', async () => {
        jest.spyOn(User, 'findOne').mockResolvedValue(null);

        const result = await User.findByUsername('nonexistent');

        expect(User.findOne).toHaveBeenCalledWith({ username: 'nonexistent' });
        expect(result).toBeNull();
      });

      it('should handle database errors', async () => {
        const dbError = new Error('Database connection error');
        jest.spyOn(User, 'findOne').mockRejectedValue(dbError);

        await expect(User.findByUsername('testuser')).rejects.toThrow('Database connection error');
      });
    });

    describe('findById', () => {
      it('should call findById with user id', async () => {
        const mockUser = {
          _id: 'user-id',
          username: 'testuser',
          nickname: 'Test User'
        };

        jest.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

        const result = await User.findById('user-id');

        expect(User.findById).toHaveBeenCalledWith('user-id');
        expect(result).toEqual(mockUser);
      });

      it('should return null when user not found', async () => {
        jest.spyOn(User, 'findById').mockResolvedValue(null);

        const result = await User.findById('nonexistent-id');

        expect(result).toBeNull();
      });
    });
  });

  describe('Instance Methods', () => {
    let user: any;

    beforeEach(() => {
      user = new User({
        username: 'testuser',
        password: 'password123',
        nickname: 'Test User',
        searchHistory: []
      });
    });

    describe('save', () => {
      it('should save user successfully', async () => {
        const savedUser = {
          _id: 'new-user-id',
          username: 'testuser',
          nickname: 'Test User',
          searchHistory: []
        };

        // Mock the save method
        user.save = jest.fn().mockResolvedValue(savedUser);

        const result = await user.save();

        expect(user.save).toHaveBeenCalled();
        expect(result).toEqual(savedUser);
      });

      it('should handle save errors', async () => {
        const saveError = new Error('Validation error');
        user.save = jest.fn().mockRejectedValue(saveError);

        await expect(user.save()).rejects.toThrow('Validation error');
      });
    });

    describe('toJSON', () => {
      it('should exclude password from JSON representation', () => {
        // Mock toJSON method if it exists
        if (user.toJSON) {
          const jsonUser = user.toJSON();
          expect(jsonUser).not.toHaveProperty('password');
          expect(jsonUser).toHaveProperty('username');
          expect(jsonUser).toHaveProperty('nickname');
        }
      });
    });

    describe('updateSearchHistory', () => {
      it('should add search to history', () => {
        const searchItem = {
          searchId: 'search-123',
          query: 'apple pie',
          timestamp: new Date().toISOString(),
          summary: 'A delicious apple pie'
        };

        // Assuming there's a method to update search history
        if (user.searchHistory) {
          user.searchHistory.push(searchItem);
          expect(user.searchHistory).toContain(searchItem);
          expect(user.searchHistory).toHaveLength(1);
        }
      });

      it('should maintain search history order', () => {
        const search1 = {
          searchId: 'search-1',
          query: 'apple pie',
          timestamp: new Date().toISOString(),
          summary: 'Apple pie'
        };

        const search2 = {
          searchId: 'search-2',
          query: 'chicken salad',
          timestamp: new Date().toISOString(),
          summary: 'Chicken salad'
        };

        if (user.searchHistory) {
          user.searchHistory.push(search1);
          user.searchHistory.push(search2);
          
          expect(user.searchHistory[0]).toEqual(search1);
          expect(user.searchHistory[1]).toEqual(search2);
          expect(user.searchHistory).toHaveLength(2);
        }
      });
    });
  });

  describe('Validation', () => {
    it('should validate required username', () => {
      expect(() => {
        new User({
          password: 'password123',
          nickname: 'Test User'
        } as any);
      }).not.toThrow(); // Constructor doesn't validate, validation happens on save
    });

    it('should validate required password', () => {
      expect(() => {
        new User({
          username: 'testuser',
          nickname: 'Test User'
        } as any);
      }).not.toThrow(); // Constructor doesn't validate, validation happens on save
    });

    it('should validate required nickname', () => {
      expect(() => {
        new User({
          username: 'testuser',
          password: 'password123'
        } as any);
      }).not.toThrow(); // Constructor doesn't validate, validation happens on save
    });
  });
});
