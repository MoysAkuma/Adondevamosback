import {ApiResponse} from  '../utils/apiResponse.js'
import {ApiError} from  '../utils/apiError.js'
import usersService from '../services/users.service.js'

const createUser = async (req, res, next) => {
    try{
        //GetrqBody
        const { name, tag, description, lastName, secondName,password, email, countryID, stateID, cityID, enabled, hide } = req.body;
        
        //Call service function to create
        const data = await usersService.createUser({
            name: name,
            tag : tag, 
            lastname : lastName, 
            secondname: secondName, 
            password : password, 
            countryid: countryID,
            stateid : stateID,
            cityid : cityID,
            description : description,
            email : email,         
            enabled : enabled,
            hide : hide
        });
        //if call was failed, show a 500 htt status
        if (!data) throw new ApiError(500, error.message);
        //if call is success, returns new created object
        new ApiResponse(201).success('Creation process sucess', data, 201);
    }
    catch(error){
        next(error);
    }

};

const getUserByID = async (req, res, next) => {
    try{
        //Get user id to search
        const { UserID } = req.params;
        const user = await usersService.getUserById(UserID, 
            "name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide");
        
        if (user.status != 200 ) throw new ApiError(500, "Failed");

        new ApiResponse(res).success(
        'Reading process sucess', 
        user.data);
    }
    catch(error){
        next(error);
    }

};

const updateUser = async (req, res, next) => {
    try{
        //Get user id to search
        const { UserID } = req.params;
        //GetrqBody
        const { name, tag, description, lastName, 
            secondName,password, email, countryID, 
            stateID, cityID, enabled, hide 
        } = req.body;
        
        //Call service function to create
        const data = await usersService.updateUser(UserID, {
            name: name,
            tag : tag, 
            lastname : lastName, 
            secondname: secondName, 
            password : password, 
            countryid: countryID,
            stateid : stateID,
            cityid : cityID,
            description : description,
            email : email,         
            enabled : enabled,
            hide : hide
        });
        //if call was failed, show a 500 htt status
        if (!data) throw new ApiError(500, error.message);
        //if call is success, returns new created object
        new ApiResponse(201).success('Edition process success', data, 200);
    }
    catch(error){
        next(error);
    }

};

const deleteUser = async (req, res, next) => {
    try{
        //Get user id to search
        const { UserID } = req.params;
        const user = usersService.deleteUserById(UserID);
        
        if (!user) throw new ApiError(500, "Failed");
        new ApiResponse(res).success('Deletion sucess');
    }
    catch(error){
        next(error);
    }

};

const getAll = async (req, res, next) => {
    try{
        const page = parseInt(req.query.page) || 10;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const user = usersService.getAllUsers(page, limit, skip);
        
        if (!!user) throw new ApiError(500, "Failed");
        new ApiResponse(res).success(
        'Reading process sucess', 
        user);
    }
    catch(error){
        next(error);
    }

};

const verifyTag = async (req, res, next) => {
    try{
        //Get tag to search
        const { tag } = req.params;
        const exists = usersService.verifyTag(tag);
        
        if (!exists) throw new ApiError(409, "Tag is used by other user");
        new ApiResponse(res).success('');
    }
    catch(error){
        next(error);
    }

};

const verifyEmail = async (req, res, next) => {
    try{

    }
    catch(error){
        next(error);
    }

};

const changePassword = async (req, res, next) => {
    try{

    }
    catch(error){
        next(error);
    }

};

const toggleVisibility = async (req, res, next) => {
    try{

    }
    catch(error){
        next(error);
    }

};

const searchUserByIDs = async (req, res, next) => {
    try{

    }
    catch(error){
        next(error);
    }

};
export default {
    getUserByID
};