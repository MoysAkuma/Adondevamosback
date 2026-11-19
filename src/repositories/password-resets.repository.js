import exceptions from '../middleware/exceptions.middleware.js';

class PasswordResetsRepository {
  constructor({ userClient }) {
    this.userClient = userClient;
  }

  /**
   * Create a password reset token record
   * @param {number} userid - User ID
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @param {string} expiredAt - Token expiration (ISO string)
   * @returns {Promise<object|null>} Created row
   */
  async createResetToken(userid, email, token, expiredAt) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .insert({
        userid,
        email,
        token,
        expired_at: expiredAt
      })
      .select();

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  /**
   * Find a password reset token
   * @param {string} token - Reset token
   * @returns {Promise<object|null>} Matching row or null
   */
  async findResetToken(token) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  /**
   * Delete a password reset token
   * @param {string} token - Reset token
   * @returns {Promise<object[]>} Deleted rows
   */
  async deleteResetToken(token) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .delete()
      .eq('token', token);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  /**
   * Delete all password reset tokens for a user
   * @param {number} userid - User ID
   * @returns {Promise<object[]>} Deleted rows
   */
  async deleteUserResetTokens(userid) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .delete()
      .eq('userid', userid);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  /**
   * Clean expired tokens (optional maintenance)
   * @param {string} expiredBefore - Delete tokens expiring before this date (ISO string)
   * @returns {Promise<object[]>} Deleted rows
   */
  async cleanExpiredTokens(expiredBefore) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .delete()
      .lt('expired_at', expiredBefore);

    if (error) throw exceptions.internal(error.message);
    return data;
  }
}

export default PasswordResetsRepository;
