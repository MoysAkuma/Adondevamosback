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
                name : name,
                secondname : secondname,
                lastname : lastname,
                email : email,
                tag : tag,
                password : password,
                description : description,
                countryid : countryid,
                stateid : stateid,
                cityid : cityid,
                enabled : true,
                hide : false
            }
        );
        if (data.status != 201) throw new ApiError(500, "Failed to create user");

        new ApiResponse(res).success('Creation process sucess', data.data, data.status);
    } catch(error){
        next(error);
    }
};

const editUser = async (req, res, next) => {
    try{
        console.log("Editing user");
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

export default {
    getUserByID,
    recoverPassword,
    verify,
    createUser,
    editUser
};