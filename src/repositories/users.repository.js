class usersRepository {
    constructor({ userClient }) {
        this.userClient = userClient;
    }
  async getUserById(userId, fields = "name, lastname, email, tag") {
    const { data, error } = await this.userClient
      .from('users')
      .select(fields)
      .eq('id', userId);
      
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  } 

  async getUserByEmail(email) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, tag, password")
        .eq('email', email);
    if (error) return { status: 500, error: error.message };
    if (data.lenght === 0) return { status: 404, error: "User not found" };
    return { status: 200, data: data };
  }
  
  async getPasswordByEmail(email) { 
    const { data, error } = await this.userClient
        .from('users')
        .select("password")
        .eq('email', email);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }
  async getUsersByField(field, value, 
    fields = "id, name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide") {
    const normalizedField = field.toLowerCase();
    
    const { data, error } = await this.userClient
        .from('users')
        .select(fields)
        .eq(normalizedField, value);
    
    if (error) return { status: 500, error: error.message };
    if (data.length === 0) return { status: 404, error: "Users not found" };

    return { status: 200, data : data };
  }
  async createUser(CreateUserRq) {
    const { data, error } = await this.userClient
      .from('users')
      .insert(
        {
            name: CreateUserRq.name,
            tag : CreateUserRq.tag, 
            lastname : CreateUserRq.lastname, 
            secondname: CreateUserRq.secondname,
            password : CreateUserRq.password, 
            countryid: CreateUserRq.countryid,
            stateid : CreateUserRq.stateid,
            cityid : CreateUserRq.cityid,
            description : CreateUserRq.description,
            email : CreateUserRq.email,         
            enabled : true,
            hide : false
        })
      .select();
    if (error) return { status: 500, error: error.message };
    return { status: 201, data: data };
  }
  async updateUser(userId, UpdateUserRq) {
    // Build update object with only provided fields
    const updateData = {};
    if (UpdateUserRq.name !== undefined) updateData.name = UpdateUserRq.name;
    if (UpdateUserRq.lastname !== undefined) updateData.lastname = UpdateUserRq.lastname;
    if (UpdateUserRq.secondname !== undefined) updateData.secondname = UpdateUserRq.secondname;
    if (UpdateUserRq.countryid !== undefined) updateData.countryid = UpdateUserRq.countryid;
    if (UpdateUserRq.stateid !== undefined) updateData.stateid = UpdateUserRq.stateid;
    if (UpdateUserRq.cityid !== undefined) updateData.cityid = UpdateUserRq.cityid;
    if (UpdateUserRq.description !== undefined) updateData.description = UpdateUserRq.description;
    

    if (UpdateUserRq.tag !== undefined) updateData.tag = UpdateUserRq.tag;
    if (UpdateUserRq.password !== undefined) updateData.password = UpdateUserRq.password;
    if (UpdateUserRq.email !== undefined) updateData.email = UpdateUserRq.email;
    
    const { data, error } = await this.userClient
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select();
    
    if (error) return { status: 500, error: error.message };
    if (!data || data.length === 0) return { status: 404, error: "User not found or not updated" };
    return { status: 200, data: data };
  }
  async searchUsersByField(field, value) {
    const normalizedField = field.toLowerCase();
    const normalizedValue = `%${value.toLowerCase()}%`;
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide")
        .ilike(normalizedField, normalizedValue)
        .limit(5);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  }

  async getUserByTag(tagid) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id, email, name, lastname, tagid, password")
        .eq('tagid', tagid);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }

  async checkAdminRole(userId) {
    const { data, error } = await this.userClient
        .from('admins')
        .select()
        .eq('id', userId);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: ( data.length === 0 ) };
  }

  async searchByEmailAndPassword(email, password) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id,name, tag, lastname")
        .eq('email', email)
        .eq('password', password)
        .single();
    if (error) return { status: 409, error: error.message };
    return { status: 200, data: data || {} };
  }

  async searchByTagAndPassword(tag, password) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, tag, lastname")
        .eq('tag', tag)
        .eq('password', password)
        .single();
    if (error) return { status: 409, error: error.message };
    return { status: 200, data: data || {} };
  }

  async searchByText(text) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, email, tag, email")
        .or(`tag.ilike.%${text}%, email.ilike.%${text}%`)
        .limit(5);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data };
  }

  async checkEmailExists(email) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id")
        .eq('email', email);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data.length > 0 };
  }

  async checkTagExists(tag) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id")
        .eq('tag', tag);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data.length > 0 };
  }

  async searchByEmail(email) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, tag, lastname, password")
        .eq('email', email)
        .single();
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data || {} };
  }

  async searchByTag(tag) {
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, tag, lastname, password")
        .eq('tag', tag)
        .single();
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data || {} };
  }

  async searchOwnerInfo(userid, fields = "id, name, tag, email") {
    //avoid duplicate user ids
    const uniqueuserids = [...new Set(userid)];
    
    //get user list
    const { data, error } = await this.userClient
        .from('users')
        .select(fields)
        .in('id', uniqueuserids);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data : data || {} };
  }
};

export default usersRepository;