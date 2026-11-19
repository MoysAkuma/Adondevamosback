import exceptions from '../middleware/exceptions.middleware.js'
import usersService from '../services/users.service.js'


const getUserByID = async (req, res, next) => {
    try{
        //Get user id to search
        const { UserID } = req.params;
        const user = await usersService.getUserById(UserID, 
            "name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide, profile_photo, profile_photo_tn");

        res.success(
        'Reading process sucess', 
        user[0]);
    }
    catch(error){
        next(error);
    }
};

const recoverPassword = async (req, res, next) => {
    try{
        const { email } = req.body;
        const recoverPassword = await usersService.recoverPassword(email);

        res.success('Password recovery email sent successfully', recoverPassword);
    }
    catch(error){
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            throw exceptions.badRequest("Token and new password are required");
        }

        if (newPassword.length < 6) {
            throw exceptions.badRequest("Password must be at least 6 characters long");
        }

        const result = await usersService.resetPassword(token, newPassword);

        res.success('Password reset successfully', result);
    } catch (error) {
        next(error);
    }
};

const verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            throw exceptions.badRequest("Reset token is required");
        }

        const result = await usersService.verifyResetToken(token);

        res.success('Token is valid', result);
    } catch (error) {
        next(error);
    }
};
const verify = async (req, res, next) => {
    
    try{
        //Get field to search
        const { field, value } = req.params;
    
        await usersService.getUserByField(field, value);

        res.success('Verification process sucess', {});
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
            throw exceptions.badRequest("Name, email, tag and password are required");
        }
        
        await usersService.createUser(
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

        res.success(201);
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
            throw exceptions.badRequest("Name, last name, country, state, and city are required");
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

        res.success('Editing process success', data);
    } catch(error){
        next(error);
    }
};

const searchUsersByField = async (req, res, next) => {
    try{
        //Get field to search
        const { field, value } = req.params;
        if ( !field || !value ) {
            throw exceptions.badRequest("Field and value are required for search");
        }
        const searchData = await usersService.getUserByField(field, value,
            "id, tag, name, lastname, email");
        res.success('Search process sucess', searchData);
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
            throw exceptions.badRequest("Field and value are required");
        }

        if (field === 'password'){
            const { current, value: newPassword } = req.body;
            if (!current || !newPassword) {
                throw exceptions.badRequest("Current and new password are required");
            }
            if (current === newPassword) {
                throw exceptions.badRequest("New password must be different from current password");
            }
        }

        await usersService.changeUserField(
            UserID,
            field,
            value,
            (field === 'password') ? { current: req.body.current } : {}   
        );
        res.successNoData(200);
    } catch(error){
        next(error);
    }
};

const getProfileData = async (req, res, next) => {
    try {
        const { UserID } = req.params;
        
        const profileData = await usersService.getProfileData(UserID);

        res.success('Profile data retrieved successfully', profileData);
    } catch (error) {
        next(error);
    }
};

const confirmEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        
        if (!token) {
            throw exceptions.badRequest("Confirmation token is required");
        }

        const result = await usersService.confirmEmail(token);

        res.success('Email confirmed successfully', result);
    } catch (error) {
        next(error);
    }
};

const uploadProfilePhoto = async (req, res, next) => {
    try {
        const { UserID } = req.params;

        // Check if user is uploading their own photo or is admin
        if (req.user.userid !== parseInt(UserID) && req.user.role !== 'admin') {
            throw exceptions.forbidden('You can only upload your own profile photo');
        }

        let imageData;
        let mimetype;
        let extension;

        // Handle multipart/form-data (file upload from Swagger/Postman)
        if (req.file) {
            imageData = req.file.buffer;
            mimetype = req.file.mimetype || 'image/jpeg';
            extension = req.file.originalname ? req.file.originalname.split('.').pop() : 'jpg';
        }
        // Handle JSON with base64 data (from frontend)
        else if (req.body.data) {
            // Handle base64 data
            let buffer;
            if (req.body.data.startsWith('data:')) {
                // Extract base64 data from data URL
                const base64Data = req.body.data.split(',')[1];
                buffer = Buffer.from(base64Data, 'base64');
            } else {
                buffer = Buffer.from(req.body.data, 'base64');
            }

            imageData = buffer;
            mimetype = req.body.mimetype || 'image/jpeg';
            extension = req.body.extension || 'jpg';
        }
        else {
            throw exceptions.badRequest('No image data provided. Send either a file or JSON with base64 data');
        }

        const result = await usersService.uploadProfilePhoto(UserID, imageData, mimetype, extension);

        res.success(
            result.message,
            {
                userId: result.userId,
                profilePhoto: result.profilePhoto,
                profilePhotoThumbnail: result.profilePhotoThumbnail
            }
        );
    } catch (error) {
        next(error);
    }
};

const assertSameUser = (req, UserID) => {
    if (Number(req.user.userid) !== Number(UserID)) {
        throw exceptions.forbidden('You can only manage your own friend requests and invitations');
    }
};

const sendFriendRequest = async (req, res, next) => {
    try {
        const { UserID } = req.params;
        const { addressedId } = req.body;
        assertSameUser(req, UserID);

        if (!addressedId) throw exceptions.badRequest("addressedId is required");

        const result = await usersService.sendFriendRequest(UserID, addressedId);

        res.success('Friend request sent successfully', result, 201);
    } catch (error) {
        next(error);
    }
};

const changeFriendRequestStatus = async (req, res, next) => {
    try {
        const { UserID, FriendRequestID } = req.params;
        const { status } = req.body;
        assertSameUser(req, UserID);

        if (!status) throw exceptions.badRequest("status is required");

        await usersService.changeFriendRequestStatus(UserID, FriendRequestID, status);

        res.successNoData(200);
    } catch (error) {
        next(error);
    }
};

const sendInvitation = async (req, res, next) => {
    try {
        const { UserID } = req.params;
        const { email } = req.body;
        assertSameUser(req, UserID);

        if (!email) throw exceptions.badRequest("email is required");

        const result = await usersService.sendInvitation(UserID, email);

        res.success('Invitation sent successfully', result, 201);
    } catch (error) {
        next(error);
    }
};

const changeInvitationStatus = async (req, res, next) => {
    try {
        const { UserID, InvitationID } = req.params;
        const { status } = req.body;
        assertSameUser(req, UserID);

        if (!status) throw exceptions.badRequest("status is required");

        await usersService.changeInvitationStatus(UserID, InvitationID, status);

        res.successNoData(200);
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
    confirmEmail,
    uploadProfilePhoto,
    sendFriendRequest,
    changeFriendRequestStatus,
    sendInvitation,
    changeInvitationStatus
};