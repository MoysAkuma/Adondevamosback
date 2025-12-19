import usersRepository from "../repositories/users.repository.js";
import ubicationService from './ubication.service.js';
import { userClient } from "../config/supabase.js";
import { matchUbicationNames } from "../mappers/ubication.mapper.js";
import { sendPasswordRecoveryEmail, sendCreateAccountEmail } from '../config/email.config.js'

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
    const { data, error } = await userClient
        .from('users')
        .select("id, email, name, lastname, tagid, password")
        .eq('email', email);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  },
  async getUserByField(field, value) {
    if (field !== 'email' && field !== 'tag') {
      return { status: 400, error: "Invalid field for verification" };
    }
    const user = await usersRepositoryInstance.getUsersByField(field, value);
    
    return user;

  },
  async getUserByTag(tagid) {
    const { data, error } = await userClient
        .from('users')
        .select("id, email, name, lastname, tagid, password")
        .eq('tagid', tagid);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  },
  async checkAdminRole(userId) {
    const { data, error } = await userClient
        .from('admins')
        .select()
        .eq('id', userId);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: ( data.length === 0 ) };
  },
  async searchByEmailAndPassword(email, password) {
    const { data, error } = await userClient
        .from('users')
        .select("id,name, tag, lastname")
        .eq('email', email)
        .eq('password', password)
        .single();
    if (error) return { status: 409, error: error.message };
    return { status: 200, data: data[0] || {} };
  },
  async searchByTagAndPassword(tag, password) {
    const { data, error } = await userClient
        .from('users')
        .select("id, name, tag, lastname")
        .eq('tag', tag)
        .eq('password', password)
        .single();
    if (error) return { status: 409, error: error.message };
    return { status: 200, data: data[0] || {} };
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
    console.log(user.data);
    // ubication names
    const ubicationNames = await ubicationService.getUbicationNamesByIDs( user.data );
    if (ubicationNames.status !== 200) return ubicationNames;
    const userWithUbicationNames = matchUbicationNames( user, ubicationNames );

    //send welcome email
    await sendCreateAccountEmail( user.data.email, user.data.tag, user.data.name, user.data.ubication );
    return user;
  },
    async updateUser(userId, UpdateUserRq) { 
        const { data, error } = await userClient
        .from('users')
        .update(
            UpdateUserRq
        )
        .eq('id', userId)
        .select()
        .single();
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data};
    },
    async searchByText(text) {
        const { data, error } = await userClient
        .from('users')
        .select("id, name, email, tag, email")
        .or(`tag.ilike.%${text}%, email.ilike.%${text}%`)
        .limit(5);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data };
    },
    async checkEmailExists(email) {
        const { data, error } = await userClient
        .from('users')
        .select("id")
        .eq('email', email);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data.length > 0 };
    },
    async checkTagExists(tag) {
        const { data, error } = await userClient
        .from('users')
        .select("id")
        .eq('tag', tag);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data.length > 0 };
    },
    async searchByEmail(email) {
        const { data, error } = await userClient
        .from('users')
        .select("id, name, tag, lastname, password")
        .eq('email', email)
        .single();
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data || {} };
    },
    async searchByTag(tag) {
        const { data, error } = await userClient
        .from('users')
        .select("id, name, tag, lastname, password")
        .eq('tag', tag)
        .single();
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data || {} };
    },
    async searchOwnerInfo( userid, fields = "id, name, tag, email") {
        //avoid duplicate user ids
        const uniqueuserids = [...new Set(userid)];
        
        //get user list
        const { data, error } = await userClient
        .from('users')
        .select(fields)
        .in('id', uniqueuserids);
        if (error) return { status: 500, error: error.message };
        return { status: 200, data : data || {} };
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
