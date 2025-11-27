import { userClient } from "../config/supabase.js";

const usersService = {
  async getUserById(userId, fields = "*") {
    console.log('Fetching user by ID:', userId);
    const { data, error } = await userClient
      .from('users')
      .select(fields)
      .eq('id', userId);
    if (error) return { status: 500, error: error.message };
    console.log(data);
    return { status: 200, data: data };
  },

  async getUserByEmail(email) {
    const { data, error } = await userClient
        .from('users')
        .select("id, email, name, lastname, tagid, password")
        .eq('email', email);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
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
    //GetrqBody
    const { name, tag, description, lastname, 
        secondname,password, email, 
        countryid, stateid, cityid
    } = CreateUserRq;
    
    const { data, error } = await userClient
      .from('users')
      .insert(
        {
            name: name,
            tag : tag, 
            lastname : lastname, 
            secondname: secondname, 
            password : password, 
            countryid: countryid,
            stateid : stateid,
            cityid : cityid,
            description : description,
            email : email,         
            enabled : true,
            hide : false
        })
        .select()
        .single();
    if (error) return { status: 500, error: error.message };
    
    return { status: 201, data : data};
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
