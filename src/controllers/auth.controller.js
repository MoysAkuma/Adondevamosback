import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import authService from '../services/auth.service.js';

/**
 * Login user
 * @route POST /v1/Login
 */
const login = async (req, res, next) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      throw new ApiError(400, 'ID and password are required');
    }

    const result = await authService.login(id, password, req);

    new ApiResponse(res).success('Login success', result.user, result.status);
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
    const result = await authService.checkAuth(req);

    new ApiResponse(res).success('Reading process success', {
      isAuthenticated: result.isAuthenticated
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

    new ApiResponse(res).success('Successfully logged out', {});
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
