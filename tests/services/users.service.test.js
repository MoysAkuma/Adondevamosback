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
  updateProfilePhotoUrls: jest.fn(),
  saveFriendRequest: jest.fn(),
  getFriendRequestById: jest.fn(),
  changeFriendRequestStatus: jest.fn(),
  saveInvitation: jest.fn(),
  getInvitationById: jest.fn(),
  changeInvitationStatus: jest.fn()
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

  test('getUserById propagates repository errors', async () => {
    usersRepo.getUserById.mockRejectedValue(new Error('db'));

    await expect(usersService.getUserById(1)).rejects.toThrow('db');
  });

  test('getUserById returns mapped ubication data on success', async () => {
    usersRepo.getUserById.mockResolvedValue([{ id: 1, countryid: 1, stateid: 2, cityid: 3 }]);
    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });
    mockMatchUbicationNames.mockReturnValue({
      data: [{ id: 1, Country: null, State: null, City: null }]
    });

    const result = await usersService.getUserById(1);

    expect(result[0].id).toBe(1);
  });

  test('createUser throws conflict when email already exists', async () => {
    usersRepo.getUsersByField.mockResolvedValueOnce([{ id: 1 }]);

    await expect(
      usersService.createUser({ email: 'a@a.com', tag: 'aa', password: 'x' })
    ).rejects.toMatchObject({ statusCode: 409, message: 'Email already exists' });
  });

  test('sendFriendRequest rejects a request to yourself', async () => {
    await expect(usersService.sendFriendRequest(5, 5)).rejects.toMatchObject({ statusCode: 400 });
    expect(usersRepo.saveFriendRequest).not.toHaveBeenCalled();
  });

  test('changeFriendRequestStatus throws forbidden when user is not the addressed user', async () => {
    usersRepo.getFriendRequestById.mockResolvedValue({ id: 1, sender_id: 3, addressed_id: 7, status: 'pending' });

    await expect(usersService.changeFriendRequestStatus(3, 1, 'accepted')).rejects.toMatchObject({ statusCode: 403 });
    expect(usersRepo.changeFriendRequestStatus).not.toHaveBeenCalled();
  });

  test('changeInvitationStatus throws forbidden when user is not the sender', async () => {
    usersRepo.getInvitationById.mockResolvedValue({ id: 1, sender_id: 3, email: 'x@y.com', status: 'pending' });

    await expect(usersService.changeInvitationStatus(9, 1, 'rejected')).rejects.toMatchObject({ statusCode: 403 });
    expect(usersRepo.changeInvitationStatus).not.toHaveBeenCalled();
  });

  test('sendInvitation normalizes the email before saving', async () => {
    usersRepo.saveInvitation.mockResolvedValue({ id: 11 });

    const result = await usersService.sendInvitation(4, '  Friend@Example.com ');

    expect(usersRepo.saveInvitation).toHaveBeenCalledWith(4, 'friend@example.com');
    expect(result).toEqual({ id: 11 });
  });

  test('createUser hashes password and sends confirmation email on success', async () => {
    usersRepo.getUsersByField
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    mockHashPassword.mockResolvedValue('hashed-pwd');

    usersRepo.createUser.mockResolvedValue([
      { id: 9, email: 'new@user.com', name: 'New', lastname: 'User', countryid: 1, stateid: 2, cityid: 3 }
    ]);

    usersRepo.createEmailConfirmation.mockResolvedValue({ token: 'tok-123' });

    mockGetUbicationNamesByIDs.mockResolvedValue({ countries: [], states: [], cities: [] });

    mockMatchUbicationNames.mockReturnValue({
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
    expect(result[0].id).toBe(9);
  });

  test('recoverPassword creates token and sends reset email', async () => {
    usersRepo.getUserByEmail.mockResolvedValue([{ id: 50, name: 'Mario', email: 'mario@mail.com' }]);
    mockGenerateResetToken.mockReturnValue('reset-token');
    passwordResetsRepo.deleteUserResetTokens.mockResolvedValue(undefined);
    passwordResetsRepo.createResetToken.mockResolvedValue({});
    mockSendPasswordResetLinkEmail.mockResolvedValue();

    const result = await usersService.recoverPassword('mario@mail.com');

    expect(passwordResetsRepo.createResetToken).toHaveBeenCalled();
    expect(mockSendPasswordResetLinkEmail).toHaveBeenCalledWith(
      'mario@mail.com',
      'https://frontend.test/reset-password?token=reset-token',
      'Mario'
    );
    expect(result).toEqual({ message: 'Password reset link sent to email' });
  });

  test('verifyResetToken throws notFound for invalid token', async () => {
    passwordResetsRepo.findResetToken.mockResolvedValue(null);

    await expect(usersService.verifyResetToken('bad-token')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Invalid reset token'
    });
  });

  test('searchByEmail throws unauthorized when password does not match', async () => {
    usersRepo.searchByEmail.mockResolvedValue({ id: 2, email: 'x@y.com', password: 'hash' });
    mockComparePassword.mockResolvedValue(false);

    await expect(usersService.searchByEmail('x@y.com', 'bad-pass')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid credentials'
    });
  });

  test('confirmEmail throws badRequest when already confirmed', async () => {
    usersRepo.verifyEmailConfirmationToken.mockResolvedValue({
      userid: 5,
      expirationstamp: '2099-01-01T00:00:00.000Z',
      confirmed: true
    });

    await expect(usersService.confirmEmail('token')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Email already confirmed'
    });
  });

  test('uploadProfilePhoto uploads and updates user photo urls', async () => {
    usersRepo.getUserById.mockResolvedValue([{ id: 99 }]);
    usersRepo.uploadProfilePhotoToStorage.mockResolvedValue({
      avatarUrl: 'avatar.webp',
      thumbnailUrl: 'thumb.webp'
    });
    usersRepo.updateProfilePhotoUrls.mockResolvedValue({
      profile_photo: 'avatar.webp',
      profile_photo_tn: 'thumb.webp'
    });

    const result = await usersService.uploadProfilePhoto(99, Buffer.from('abc'), 'image/webp', 'webp');

    expect(result.profilePhoto).toBe('avatar.webp');
    expect(result.profilePhotoThumbnail).toBe('thumb.webp');
  });
});
