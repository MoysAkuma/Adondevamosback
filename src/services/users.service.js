import usersRepository from "../repositories/users.repository.js";
import ubicationService from './ubication.service.js';
import { userClient } from "../config/supabase.js";
import { matchUbicationNames } from "../mappers/ubication.mapper.js";
import { sendPasswordRecoveryEmail, sendCreateAccountEmail } from '../config/email.config.js'
import tripsService from './trips.service.js';

const usersRepositoryInstance = new usersRepository({ userClient });

const usersService = {
  async getUserById(userId, fields = "name, lastname, email, tag, countryid, stateid, cityid") {
    const user = await usersRepositoryInstance.getUserById(userId, fields);
    if (user.status != 200) return { status: 500, error: user.error || "Service error" };
    
    // ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs( user.data );
    if (ubicationNames.status !== 200) return ubicationNames;
    const userWithUbicationNames = matchUbicationNames( user, ubicationNames );

    return { status: 200, data: userWithUbicationNames.data || {} };
  },

  async getUserByIdWithTrips(userId, fields = "name, lastname, email, tag, countryid, stateid, cityid") {
    // Get user info
    const user = await usersRepositoryInstance.getUserById(userId, fields);
    if (user.status != 200) return { status: 500, error: user.error || "Service error" };
    
    // Get ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs(user.data);
    if (ubicationNames.status !== 200) return ubicationNames;
    const userWithUbicationNames = matchUbicationNames(user, ubicationNames);

    // Get last 3 trips created by this user
    const tripsResult = await tripsService.searchTrips({ ownerid: userId });
    let userTrips = [];
    if (tripsResult.status === 200 && tripsResult.data) {
      // Sort by initialdate descending and take first 3
      userTrips = tripsResult.data
        .sort((a, b) => new Date(b.initialdate) - new Date(a.initialdate))
        .slice(0, 3);
    }

    return { 
      status: 200, 
      data: {
        ...userWithUbicationNames.data,
        recentTrips: userTrips
      }
    };
  },
  async recoverPassword(email) {
    //get email and password
    const userData = await usersRepositoryInstance.getUserByEmail(email);
    
    if (userData.status != 200) return { status: 500, error: userData.error || "Service error" };
    
    const password = userData.data[0].password;
    
    //send email
    try {
      await sendPasswordRecoveryEmail(email, password, userData.data[0].name);
      return { status: 200, data: null };
    } catch (error) {
      return { status: 500, error: "Failed to send recovery email" };
    }

  },
  async getUserByEmail(email) {
    const user = await usersRepositoryInstance.getUserByEmail(email);
    return user;
  },
  async getUserByField(field, value, fieldsToReturn = "id, name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide") {
    const user = await usersRepositoryInstance.getUsersByField(field, value, fieldsToReturn);
    
    return user;

  },
  async getUserByTag(tagid) {
    return await usersRepositoryInstance.getUserByTag(tagid);
  },
  async checkAdminRole(userId) {
    return await usersRepositoryInstance.checkAdminRole(userId);
  },
  async searchByEmailAndPassword(email, password) {
    return await usersRepositoryInstance.searchByEmailAndPassword(email, password);
  },
  async searchByTagAndPassword(tag, password) {
    return await usersRepositoryInstance.searchByTagAndPassword(tag, password);
  },
  async createUser(CreateUserRq) {
    //check if email or tag already exists
    const checkUserEmail = await usersRepositoryInstance.getUsersByField('email', CreateUserRq.email);
    if (checkUserEmail.status === 200) {
      return { status: 409, error: "Email already exists" };
    }

    const checkUserTag = await usersRepositoryInstance.getUsersByField('tag', CreateUserRq.tag);
    if (checkUserTag.status === 200) {
      return { status: 409, error: "Tag already exists" };
    }

    const user = await usersRepositoryInstance.createUser(CreateUserRq);
    if (user.status != 201) return { status: 500, error: user.error || "Service error" };

    // ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs( user.data );
    if (ubicationNames.status !== 200) return ubicationNames;
    const userWithUbicationNames = matchUbicationNames( user, ubicationNames );
    
    const infoToMail = userWithUbicationNames.data[0];
    
    
    //send welcome email
    await sendCreateAccountEmail( infoToMail.email, 
      infoToMail.tag, 
      infoToMail.name + " " + infoToMail.lastname, 
      infoToMail.City.name + ", " + 
      infoToMail.State.name + ", " + 
      infoToMail.Country.name );

    return userWithUbicationNames;
  },
  async updateUser(userId, UpdateUserRq) { 
    const userExists = await usersRepositoryInstance.getUserById(userId);
    if (userExists.status !== 200) {
      return { status: 404, error: "User not found" };
    }
    const user = await usersRepositoryInstance.updateUser(userId, UpdateUserRq);
    if (user.status != 200) return { status: 500, error: user.error || "Service error" };
    return user;
  },
    async searchByText(text) {
        return await usersRepositoryInstance.searchByText(text);
    },
    async checkEmailExists(email) {
        return await usersRepositoryInstance.checkEmailExists(email);
    },
    async checkTagExists(tag) {
        return await usersRepositoryInstance.checkTagExists(tag);
    },
    async searchByEmail(email) {
        return await usersRepositoryInstance.searchByEmail(email);
    },
    async searchByTag(tag) {
        return await usersRepositoryInstance.searchByTag(tag);
    },
    async searchOwnerInfo( userid, fields = "id, name, tag, email") {
        return await usersRepositoryInstance.searchOwnerInfo(userid, fields);
    },
    async changeUserField( userid, field, value, extrafields = {}) {
      const userExists = await usersRepositoryInstance.getUserById(userid);

      if (userExists.status !== 200) {
        return { status: 409, error: "User not found" };
      }

      if (!(field in userExists.data[0])) {
        return { status: 400, error: `Field ${field} does not exist on user` };
      }
      
      if (field === 'password' 
        && !extrafields.current != userExists.data[0].password ) {
        return { status: 400, error: "This password is different from the current password" };
      }

      const updateData = { [field]: value };
      const user = await usersRepositoryInstance.updateUser(userid, updateData);
      if (user.status != 200) return { status: 500, error: user.error || "Service error" };
      return user;
    }
};

export default usersService;
/**
 * @swagger
 * components:
 *   schemas:
 *    LoginRq:
 *      type: object
 *     properties:
 * 
 *    id:
 *      type: string
 *    description: Email or Tag ID of the user
 *   password:
 *    type: string
 *   description: Password of the user
 * required:
 *     - id
 *    - password
 *   LoginRs:
 *    type: object
 *   properties:
 *   id:
 *    type: string
 *   description: Email or Tag ID of the user
 * password:
 *  type: string
 * description: Password of the user
 * required:
 *   - id
 *  - password
 */
