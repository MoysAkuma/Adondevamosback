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
        const { email } = req.body;
        const recoverPassword = await usersService.recoverPassword(email);
        
        if (recoverPassword.status != 200) throw new ApiError(500, "Failed to recover password");

        new ApiResponse(res).success('Password recovery email sent successfully',null);
    }
    catch(error){
        next(error);
    }
};
const verify = async (req, res, next) => {
    console.log("verifying user");
    try{
        //Get field to search
        const { field, value } = req.params;
        console.log(field, value);
        const verifyData = await usersService.getUserByField(field, value);
        if (verifyData.status != 200 ) throw new ApiError(verifyData.status, "Failed to verify user");

        new ApiResponse(res).success('Verification process sucess', {});
    }   
    catch(error){
        next(error);
    }
};

export default {
    getUserByID,
    recoverPassword,
    verify
};