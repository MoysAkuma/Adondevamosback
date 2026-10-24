import { describe, test, expect, beforeEach, jest } from '@jest/globals';

const usersRepo = {
  getUserById: jest.fn(),
  getUsersByField: jest.fn(),
  createUser: jest.fn(),
  createEmailConfirmation: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn(),
  searchByEmail: jest.fn(),
  verifyEmailConfirmationToken: jest.fn(),
  confirmEmail: jest.fn(),
  uploadProfilePhotoToStorage: jest.fn(),
  updateProfilePhotoUrls: jest.fn()
};

const passwordResetsRepo = {
  deleteUserResetTokens: jest.fn(),
  createResetToken: jest.fn(),
  findResetToken: jest.fn(),
  deleteResetToken: jest.fn()
};

const votesRepo = {
  countVotesByUserId: jest.fn(),
  getVotedTripsByUserId: jest.fn()
};

const mockUsersRepositoryCtor = jest.fn(() => usersRepo);
const mockPasswordResetsRepositoryCtor = jest.fn(() => passwordResetsRepo);
const mockVotesRepositoryCtor = jest.fn(() => votesRepo);

const mockGetUbicationNamesByIDs = jest.fn();
const mockMatchUbicationNames = jest.fn();
const mockSearchTrips = jest.fn();

const mockSendPasswordResetLinkEmail = jest.fn();
const mockSendEmailConfirmationEmail = jest.fn();

const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
const mockGenerateResetToken = jest.fn();

jest.unstable_mockModule('../../src/repositories/users.repository.js', () => ({
  default: mockUsersRepositoryCtor
}));

jest.unstable_mockModule('../../src/repositories/password-resets.repository.js', () => ({
  default: mockPasswordResetsRepositoryCtor
}));

jest.unstable_mockModule('../../src/repositories/votes.repository.js', () => ({
  default: mockVotesRepositoryCtor
}));

jest.unstable_mockModule('../../src/services/ubication.service.js', () => ({
  default: {
    getUbicationNamesByIDs: mockGetUbicationNamesByIDs
  }
}));

jest.unstable_mockModule('../../src/mappers/ubication.mapper.js', () => ({
  matchUbicationNames: mockMatchUbicationNames
}));

jest.unstable_mockModule('../../src/services/trips.service.js', () => ({
  default: {
    searchTrips: mockSearchTrips,
    getTripById: jest.fn()
  }
}));

jest.unstable_mockModule('../../src/config/email.config.js', () => ({
  sendPasswordRecoveryEmail: jest.fn(),
  sendPasswordResetLinkEmail: mockSendPasswordResetLinkEmail,
  sendCreateAccountEmail: jest.fn(),
  sendEmailConfirmationEmail: mockSendEmailConfirmationEmail
}));

jest.unstable_mockModule('../../src/utils/password.js', () => ({
  hashPassword: mockHashPassword,
  comparePassword: mockComparePassword,
  generateTemporaryPassword: jest.fn(),
  generateResetToken: mockGenerateResetToken
}));

jest.unstable_mockModule('../../src/config/env.js', () => ({
  env: {
    FRONT_URL: 'https://frontend.test'
  }
}));

jest.unstable_mockModule('../../src/config/supabase.js', () => ({
  userClient: {},
  votesClient: {}
}));

const { default: usersService } = await import('../../src/services/users.service.js');

describe('users.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserById returns 500 when repository fails', async () => {
    usersRepo.getUserById.mockResolvedValue({ status: 500, error: 'db' });

    const result = await usersService.getUserById(1);

    expect(result).toEqual({ status: 500, error: 'db' });
  });

  test('getUserById returns mapped ubication data on success', async () => {
    usersRepo.getUserById.mockResolvedValue({
      status: 200,
      data: [{ id: 1, countryid: 1, stateid: 2, cityid: 3 }]
    });
    mockGetUbicationNamesByIDs.mockResolvedValue({
      status: 200,
      data: { countries: [], states: [], cities: [] }
    });
    mockMatchUbicationNames.mockReturnValue({
      status: 200,
      data: [{ id: 1, Country: null, State: null, City: null }]
    });

    const result = await usersService.getUserById(1);

    expect(result.status).toBe(200);
    expect(result.data[0].id).toBe(1);
  });

  test('createUser returns 409 when email already exists', async () => {
    usersRepo.getUsersByField.mockResolvedValueOnce({ status: 200, data: [{ id: 1 }] });

    const result = await usersService.createUser({ email: 'a@a.com', tag: 'aa', password: 'x' });

    expect(result).toEqual({ status: 409, error: 'Email already exists' });
  });

  test('createUser hashes password and sends confirmation email on success', async () => {
    usersRepo.getUsersByField
      .mockResolvedValueOnce({ status: 404, data: [] })
      .mockResolvedValueOnce({ status: 404, data: [] });

    mockHashPassword.mockResolvedValue('hashed-pwd');

    usersRepo.createUser.mockResolvedValue({
      status: 201,
      data: [{ id: 9, email: 'new@user.com', name: 'New', lastname: 'User', countryid: 1, stateid: 2, cityid: 3 }]
    });

    usersRepo.createEmailConfirmation.mockResolvedValue({
      status: 201,
      data: { token: 'tok-123' }
    });

    mockGetUbicationNamesByIDs.mockResolvedValue({
      status: 200,
      data: { countries: [], states: [], cities: [] }
    });

    mockMatchUbicationNames.mockReturnValue({
      status: 200,
      data: [{ id: 9, email: 'new@user.com', name: 'New', lastname: 'User' }]
    });

    const result = await usersService.createUser({
      email: 'new@user.com',
      tag: 'newuser',
      password: 'plain-pass'
    });

    expect(mockHashPassword).toHaveBeenCalledWith('plain-pass');
    expect(usersRepo.createUser).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed-pwd' }));
    expect(mockSendEmailConfirmationEmail).toHaveBeenCalledWith('new@user.com', 'New User', 'tok-123');
    expect(result.status).toBe(200);
  });

  test('recoverPassword creates token and sends reset email', async () => {
    usersRepo.getUserByEmail.mockResolvedValue({
      status: 200,
      data: [{ id: 50, name: 'Mario', email: 'mario@mail.com' }]
    });
    mockGenerateResetToken.mockReturnValue('reset-token');
    passwordResetsRepo.deleteUserResetTokens.mockResolvedValue({ status: 200 });
    passwordResetsRepo.createResetToken.mockResolvedValue({ status: 201, data: {} });
    mockSendPasswordResetLinkEmail.mockResolvedValue();

    const result = await usersService.recoverPassword('mario@mail.com');

    expect(passwordResetsRepo.createResetToken).toHaveBeenCalled();
    expect(mockSendPasswordResetLinkEmail).toHaveBeenCalledWith(
      'mario@mail.com',
      'https://frontend.test/reset-password?token=reset-token',
      'Mario'
    );
    expect(result.status).toBe(200);
  });

  test('verifyResetToken returns 404 for invalid token', async () => {
    passwordResetsRepo.findResetToken.mockResolvedValue({ status: 404 });

    const result = await usersService.verifyResetToken('bad-token');

    expect(result).toEqual({ status: 404, error: 'Invalid reset token' });
  });

  test('searchByEmail returns 401 when password does not match', async () => {
    usersRepo.searchByEmail.mockResolvedValue({
      status: 200,
      data: { id: 2, email: 'x@y.com', password: 'hash' }
    });
    mockComparePassword.mockResolvedValue(false);

    const result = await usersService.searchByEmail('x@y.com', 'bad-pass');

    expect(result).toEqual({ status: 401, error: 'Invalid credentials' });
  });

  test('confirmEmail returns 400 when already confirmed', async () => {
    usersRepo.verifyEmailConfirmationToken.mockResolvedValue({
      status: 200,
      data: { userid: 5, expirationstamp: '2099-01-01T00:00:00.000Z', confirmed: true }
    });

    const result = await usersService.confirmEmail('token');

    expect(result).toEqual({ status: 400, error: 'Email already confirmed' });
  });

  test('uploadProfilePhoto uploads and updates user photo urls', async () => {
    usersRepo.getUserById.mockResolvedValue({ status: 200, data: [{ id: 99 }] });
    usersRepo.uploadProfilePhotoToStorage.mockResolvedValue({
      status: 200,
      data: { avatarUrl: 'avatar.webp', thumbnailUrl: 'thumb.webp' }
    });
    usersRepo.updateProfilePhotoUrls.mockResolvedValue({
      status: 200,
      data: { profile_photo: 'avatar.webp', profile_photo_tn: 'thumb.webp' }
    });

    const result = await usersService.uploadProfilePhoto(99, Buffer.from('abc'), 'image/webp', 'webp');

    expect(result.status).toBe(200);
    expect(result.data.profilePhoto).toBe('avatar.webp');
    expect(result.data.profilePhotoThumbnail).toBe('thumb.webp');
  });
});
