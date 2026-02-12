/**
 * Session Service
 * Handles all session-related operations
 */

/**
 * Creates a new session for a user
 * @param {Object} req - Express request object
 * @param {Object} userData - User data to store in session
 * @returns {Promise<Object>} Session data
 */
const createSession = (req, userData) => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      return reject(new Error("Session middleware is not configured"));
    }

    req.session.userId = userData.id;
    req.session.isAdmin = userData.isAdmin;
    req.session.loginTime = new Date().toISOString();

    req.session.save((err) => {
      if (err) {
        return reject(new Error("Session save error: " + err.message));
      }
      
      resolve({
        userId: req.session.userId,
        isAdmin: req.session.isAdmin,
        loginTime: req.session.loginTime
      });
    });
  });
};

/**
 * Destroys the current session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const destroySession = (req, res) => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      return reject(new Error("No session found"));
    }

    req.session.destroy((err) => {
      if (err) {
        return reject(new Error("Error destroying session: " + err.message));
      }
      
      res.clearCookie("sessionId");
      resolve();
    });
  });
};

/**
 * Validates if a session exists and is valid
 * @param {Object} req - Express request object
 * @returns {Object} Validation result
 */
const validateSession = (req) => {
  if (!req.session || !req.session.userId) {
    return {
      isValid: false,
      userId: null
    };
  }

  return {
    isValid: true,
    userId: req.session.userId,
    isAdmin: req.session.isAdmin,
    loginTime: req.session.loginTime
  };
};

/**
 * Gets session data
 * @param {Object} req - Express request object
 * @returns {Object|null} Session data or null
 */
const getSessionData = (req) => {
  if (!req.session || !req.session.userId) {
    return null;
  }

  return {
    userId: req.session.userId,
    isAdmin: req.session.isAdmin,
    loginTime: req.session.loginTime
  };
};

/**
 * Updates session data
 * @param {Object} req - Express request object
 * @param {Object} updates - Data to update in session
 * @returns {Promise<Object>} Updated session data
 */
const updateSession = (req, updates) => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      return reject(new Error("Session middleware is not configured"));
    }

    Object.assign(req.session, updates);

    req.session.save((err) => {
      if (err) {
        return reject(new Error("Session update error: " + err.message));
      }
      
      resolve(req.session);
    });
  });
};

const sessionService = {
  createSession,
  destroySession,
  validateSession,
  getSessionData,
  updateSession
};

export default sessionService;
