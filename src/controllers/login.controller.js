import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import userService from '../services/users.service.js';

//login user
const login = async (req, res, next) => {
  try {
    //GetrqBody
    const { id, password } = req.body;
    const isEmail = isEmail(id);
    if (isEmail) {
      const data = await userService.searchByEmail(id, password);
      new ApiResponse(res).success('Creation process sucess', data.data, data.status);
    } else {
      const data = await userService.searchByTag(id, password);
      new ApiResponse(res).success('Creation process sucess', data.data, data.status);
    }
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
        req.session.isAdmin = !!datarole;
        req.session.loginTime = new Date().toISOString();
        new ApiResponse(res).success('Creation process sucess', {
            id: data.data.id,
            tag: data.data.tag,
            role: isAdmin ? 'Admin' : 'User',
            name: data.data.name,
            lastname: data.data.lastname,
            sessionId: req.sessionID
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
    if (req.session.userId) {
        const data = await userService.searchById(req.session.userId, res);
        if (data.status == 200 && data.data.id) {
            new ApiResponse(res).success(
                'Reading process sucess', 
                {
                    "isAuthenticated" : true
                }
            );
        }
    } else {
        new ApiError(401, 'User not authenticated');
    }
    
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