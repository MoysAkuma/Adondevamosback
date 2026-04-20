class PasswordResetsRepository {
  constructor({ userClient }) {
    this.userClient = userClient;
  }

  /**
   * Create a password reset token record
   * @param {number} userid - User ID
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @param {Date} expiredAt - Token expiration date
   * @returns {Promise<{status: number, data?: any, error?: string}>}
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

    if (error) return { status: 500, error: error.message };
    return { status: 201, data: data };
  }

  /**
   * Find a password reset token
   * @param {string} token - Reset token
   * @returns {Promise<{status: number, data?: any, error?: string}>}
   */
  async findResetToken(token) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .single();

    if (error) return { status: 404, error: 'Token not found' };
    return { status: 200, data: data };
  }

  /**
   * Delete a password reset token
   * @param {string} token - Reset token
   * @returns {Promise<{status: number, data?: any, error?: string}>}
   */
  async deleteResetToken(token) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .delete()
      .eq('token', token);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }

  /**
   * Delete all password reset tokens for a user
   * @param {number} userid - User ID
   * @returns {Promise<{status: number, data?: any, error?: string}>}
   */
  async deleteUserResetTokens(userid) {
    const { data, error } = await this.userClient
      .from('password_resets')
      .delete()
      .eq('userid', userid);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }

  /**
   * Clean expired tokens (optional maintenance)
   * @returns {Promise<{status: number, data?: any, error?: string}>}
   */
  async cleanExpiredTokens() {
    const now = new Date().toISOString();
    const { data, error } = await this.userClient
      .from('password_resets')
      .delete()
      .lt('expired_at', now);

    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }
}

export default PasswordResetsRepository;
