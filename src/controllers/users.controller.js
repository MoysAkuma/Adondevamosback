import {ApiResponse} from  '../utils/apiResponse.js'
import {ApiError} from  '../utils/apiError.js'
import usersService from '../services/users.service.js'

const getUserByID = async (req, res, next) => {
    try{
        //Get user id to search
        const { UserID } = req.params;
        const user = await usersService.getUserById(UserID, 
            "name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide");
        
        if (user.status != 200 ) throw new ApiError(500, "Failed");

        new ApiResponse(res).success(
        'Reading process sucess', 
        user.data[0]);
    }
    catch(error){
        next(error);
    }
};

const recoverPassword = async (req, res, next) => {
    try{
        const { email } = req.params;
        const user = await usersService.getPasswordByEmail(email);
        if (user.status != 200 ) throw new ApiError(500, "Failed to recover password");

        new ApiResponse(res).success(
        'Password recovery sucess', 
        user.data[0]);
    }
    catch(error){
        next(error);
    }
};

export default {
    getUserByID
};