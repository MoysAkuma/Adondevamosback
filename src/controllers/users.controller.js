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
        
        if (recoverPassword.status != 200) throw new ApiError(recoverPassword.status, recoverPassword.error || "Failed to recover password");

        new ApiResponse(res).success('Password recovery email sent successfully', recoverPassword.data);
    }
    catch(error){
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            throw new ApiError(400, "Token and new password are required");
        }

        if (newPassword.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        const result = await usersService.resetPassword(token, newPassword);
        
        if (result.status !== 200) {
            throw new ApiError(result.status, result.error || "Failed to reset password");
        }

        new ApiResponse(res).success('Password reset successfully', result.data);
    } catch (error) {
        next(error);
    }
};

const verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            throw new ApiError(400, "Reset token is required");
        }

        const result = await usersService.verifyResetToken(token);
        
        if (result.status !== 200) {
            throw new ApiError(result.status, result.error || "Invalid or expired token");
        }

        new ApiResponse(res).success('Token is valid', result.data);
    } catch (error) {
        next(error);
    }
};
const verify = async (req, res, next) => {
    
    try{
        //Get field to search
        const { field, value } = req.params;
    
        const verifyData = await usersService.getUserByField(field, value);
        if (verifyData.status != 200 ) throw new ApiError(verifyData.status, "Failed to verify user");

        new ApiResponse(res).success('Verification process sucess', {});
    }   
    catch(error){
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try{
        //GetrqBody
        const { name, tag, description, lastname, 
            secondname,password, email, 
            countryid, stateid, cityid } = req.body;
        //validate name, email, tag, password
        if (!name || !email || !tag || !password) {
            throw new ApiError(400, "Name, email, tag and password are required");
        }
        
        const data = await usersService.createUser(
            {
                name : name.trim(),
                secondname : secondname,
                lastname : lastname.trim(),
                email : email.trim(),
                tag : tag.trim(),
                password : password,
                description : description,
                countryid : countryid,
                stateid : stateid,
                cityid : cityid,
                enabled : true,
                hide : false
            }
        );
        if (data.status != 201) throw new ApiError(data.status, "Failed to create user");

        new ApiResponse(res).success(201);
    } catch(error){
        next(error);
    }
};

const editUser = async (req, res, next) => {
    try{
        //Get user id to search
        const { UserID } = req.params;
        //GetrqBody
        const { name, description, lastname, secondname,
            countryid, stateid, cityid } = req.body;

        //validate name, email, tag, password
        if (!name || !lastname || !countryid || !stateid || !cityid) {
            throw new ApiError(400, "Name, last name, country, state, and city are required");
        }
        
        const data = await usersService.updateUser(
            UserID,
            {
                name : name,
                secondname : secondname,
                lastname : lastname,
                description : description,
                countryid : countryid,
                stateid : stateid,
                cityid : cityid
            }
        );
        if (data.status != 200) throw new ApiError(data.status, "Failed to edit user");

        new ApiResponse(res).success('Editing process success', data.data, data.status);
    } catch(error){
        next(error);
    }
};

const searchUsersByField = async (req, res, next) => {
    try{
        //Get field to search
        const { field, value } = req.params;
        if ( !field || !value ) {
            throw new ApiError(400, "Field and value are required for search");
        }
        const searchData = await usersService.getUserByField(field, value,
            "id, tag, name, lastname, email");
        if (searchData.status != 200 ) throw new ApiError(searchData.status, "Failed to search users");
        new ApiResponse(res).success('Search process sucess', searchData.data);
    }
    catch(error){
        next(error);
    }
};

const changeUserField = async (req, res, next) => {
    try{
        
        //Get user id to search
        const { UserID, field } = req.params;
        
        //GetrqBody
        const { value } = req.body;

        if (!field || !value) {
            throw new ApiError(400, "Field and value are required");
        }

        if (field === 'password'){
            const { current, value: newPassword } = req.body;
            if (!current || !newPassword) {
                throw new ApiError(400, "Current and new password are required");
            }
            if (current === newPassword) {
                throw new ApiError(400, "New password must be different from current password");
            }
        }

        const data = await usersService.changeUserField(
            UserID,
            field,
            value,
            (field === 'password') ? { current: req.body.current } : {}   
        );
        if (data.status != 200) throw new ApiError(data.status, "Failed to change user field");
        new ApiResponse(res).successNoData(data.status);
    } catch(error){
        next(error);
    }
};

const getProfileData = async (req, res, next) => {
    try {
        const { UserID } = req.params;
        
        const profileData = await usersService.getProfileData(UserID);
        
        if (profileData.status != 200) {
            throw new ApiError(profileData.status, profileData.error || "Failed to get profile data");
        }

        new ApiResponse(res).success('Profile data retrieved successfully', profileData.data);
    } catch (error) {
        next(error);
    }
};

const confirmEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            throw new ApiError(400, "Confirmation token is required");
        }

        const result = await usersService.confirmEmail(token);
        
        if (result.status !== 200) {
            throw new ApiError(result.status, result.error || "Failed to confirm email");
        }

        new ApiResponse(res).success('Email confirmed successfully', result.data);
    } catch (error) {
        next(error);
    }
};

export default {
    getUserByID,
    recoverPassword,
    resetPassword,
    verifyResetToken,
    verify,
    createUser,
    editUser,
    searchUsersByField,
    changeUserField,
    getProfileData,
    confirmEmail
};