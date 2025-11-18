import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import userService from '../services/users.service.js';

//login user
const login = async (req, res, next) => {
  try {
    //GetrqBody
    const { id, password } = req.body;
    //Check if id is email or tag
    const checkisEmail = isEmail(id);
    //Search user
    const data = (checkisEmail) ? 
      await userService.searchByEmail(id, password) : 
      await userService.searchByTag(id, password);
    //Validate user found
    if(data.status != 200) throw new ApiError(500, error.message);
    if (data.data.id == null) throw new ApiError(404, 'User not found');
    const isAdmin = await userService.checkAdminRole(data.data.id);
    if (req.session) {
        req.session.userId = data.data.id;
        req.session.isAdmin = isAdmin;
        req.session.loginTime = new Date().toISOString();
    }
    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }

        // Set session data
        req.session.userId = data.id;
        req.session.isAdmin = !!isAdmin;
        req.session.loginTime = new Date().toISOString();
        new ApiResponse(res).success('Creation process sucess', {
            id: data.data.id,
            tag: data.data.tag,
            role: isAdmin ? 'Admin' : 'User',
            name: data.data.name,
            lastname: data.data.lastname
        }, data.status);
        
    });
    
  } catch(err){
    next(err);
  } 
};

// Email validation function
function isEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
}

const checkAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return next(new ApiError(401, 'User not authenticated'));
    }

    const data = await userService.getUserById(req.session.userId);
    const userExists = data && data.status === 200 && data.data &&
      (Array.isArray(data.data) ? data.data.length > 0 : !!data.data.id);

    new ApiResponse(res).success(
      'Reading process sucess',
      { isAuthenticated: !!userExists }
    );
  } catch (err) {
    next(err);
  }
};


const logout = async (req, res, next) => {
  try {
     req.session.destroy( 
        err => {
            if(err){
                new ApiError(500, 'Error logging out', err);
            }
            res.clearCookie("sessionId");
            new ApiResponse(res).success(
            'successfully logged out', {});
        }
    );
  } catch (err) {
    next(err);
  }
};


const loginController = {
  login,
  checkAuth,
  logout
};
    
export default loginController;