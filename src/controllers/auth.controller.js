import exceptions from '../middleware/exceptions.middleware.js';
import authService from '../services/auth.service.js';

/**
 * Login user
 * @route POST /v1/Login
 */
const login = async (req, res, next) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      throw exceptions.badRequest('ID and password are required');
    }

    const result = await authService.login(id, password, req);

    res.success('Login success', {
      user: result.user,
      token: result.token
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Check authentication status
 * @route GET /v1/check-auth
 */
const checkAuth = async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');

    const result = await authService.checkAuth(req);

    res.success('Reading process success', {
      isAuthenticated: result.isAuthenticated,
      id: result.id,
      tag: result.tag,
      role: result.role,
      isAdmin: result.isAdmin
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout user
 * @route POST /v1/Logout
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req, res);

    res.success('Successfully logged out', {});
  } catch (err) {
    next(err);
  }
};

const authController = {
  login,
  checkAuth,
  logout
};

export default authController;
