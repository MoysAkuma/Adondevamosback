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
    console.log(email);
    const { data, error } = await this.userClient
        .from('users')
        .select("id, name, tag, password")
        .eq('email', email);
    console.log(data, error);
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
  async getUsersByField(field, value) {
    const normalizedField = field.toLowerCase();
    const normalizedValue = typeof value === 'string' ? value.toLowerCase() : value;
    const { data, error } = await this.userClient
        .from('users')
        .select("id")
        .ilike(normalizedField, normalizedValue);
    if (error) return { status: 500, error: error.message };
    if (data.length === 0) return { status: 404, error: "User not found" };

    return { status: 200 };
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
    console.log("Update Data:", userId);
    const { data, error } = await this.userClient
      .from('users')
      .update(updateData)
      .eq("id", userId)
      .select();
      
    console.log(data, error);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }
};

export default usersRepository;