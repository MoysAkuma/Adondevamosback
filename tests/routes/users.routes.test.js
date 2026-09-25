import { describe, test, expect, jest } from '@jest/globals';

const mockRouter = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn()
};

const mockAuthenticate = jest.fn();
const mockUploadMiddleware = jest.fn();
const mockOptionalSingleUpload = jest.fn(() => mockUploadMiddleware);

const mockUsersController = {
  recoverPassword: jest.fn(),
  resetPassword: jest.fn(),
  verifyResetToken: jest.fn(),
  confirmEmail: jest.fn(),
  verify: jest.fn(),
  searchUsersByField: jest.fn(),
  uploadProfilePhoto: jest.fn(),
  createUser: jest.fn(),
  getUserByID: jest.fn(),
  getProfileData: jest.fn(),
  editUser: jest.fn(),
  changeUserField: jest.fn()
};

jest.unstable_mockModule('express', () => ({
  default: {
    Router: () => mockRouter
  }
}));

jest.unstable_mockModule('../../src/middleware/auth.middleware.js', () => ({
  authenticate: mockAuthenticate
}));

jest.unstable_mockModule('../../src/middleware/upload.middleware.js', () => ({
  optionalSingleUpload: mockOptionalSingleUpload
}));

jest.unstable_mockModule('../../src/controllers/users.controller.js', () => ({
  default: mockUsersController
}));

const { default: router } = await import('../../src/routes/users.routes.js');

describe('users.routes', () => {
  test('exports express router instance', () => {
    expect(router).toBe(mockRouter);
  });

  test('registers public routes', () => {
    expect(mockRouter.post).toHaveBeenCalledWith('/Users/RecoverPassword', mockUsersController.recoverPassword);
    expect(mockRouter.post).toHaveBeenCalledWith('/Users/ResetPassword', mockUsersController.resetPassword);
    expect(mockRouter.post).toHaveBeenCalledWith('/Users', mockUsersController.createUser);
    expect(mockRouter.get).toHaveBeenCalledWith('/Users/VerifyResetToken', mockUsersController.verifyResetToken);
    expect(mockRouter.get).toHaveBeenCalledWith('/Users/ConfirmEmail', mockUsersController.confirmEmail);
    expect(mockRouter.get).toHaveBeenCalledWith('/Users/Verify/:field/:value', mockUsersController.verify);
    expect(mockRouter.get).toHaveBeenCalledWith('/Users/Search/:field/:value', mockUsersController.searchUsersByField);
    expect(mockRouter.get).toHaveBeenCalledWith('/Users/:UserID', mockUsersController.getUserByID);
    expect(mockRouter.get).toHaveBeenCalledWith('/Users/:UserID/Profile', mockUsersController.getProfileData);
  });

  test('registers protected routes with expected middleware', () => {
    expect(mockOptionalSingleUpload).toHaveBeenCalledWith('file');
    expect(mockRouter.post).toHaveBeenCalledWith('/Users/:UserID/ProfilePhoto', mockAuthenticate, mockUploadMiddleware, mockUsersController.uploadProfilePhoto);
    expect(mockRouter.put).toHaveBeenCalledWith('/Users/:UserID', mockAuthenticate, mockUsersController.editUser);
    expect(mockRouter.patch).toHaveBeenCalledWith('/Users/:UserID/:field', mockAuthenticate, mockUsersController.changeUserField);
  });
});