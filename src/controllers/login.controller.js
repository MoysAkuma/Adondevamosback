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
    if(data.status != 200) throw new ApiError(500, error.message || "Service error");
    if (!data.data || data.data.id == null ) throw new ApiError(404, 'User not found');
    
    //check if user is admin
    const isAdmin = (await userService.checkAdminRole(data.data.id)).data;

    //check if session is set
    if(!req.session) {
      return next( new ApiError(500, "Session middleware is not configured"));
    }
    
    //set session
    req.session.userId = data.data.id;
    req.session.isAdmin = !!isAdmin;
    req.session.loginTime = new Date().toISOString();

    req.session.save((err) => {
        if (err) {
            return next( new ApiError(500, "Session save error", err) );
        }

        new ApiResponse(res).success('Login success', {
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
    
    new ApiResponse(res).success(
      'Reading process sucess',
      { isAuthenticated: data.status === 200 }
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