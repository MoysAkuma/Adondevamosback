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
};

export default usersRepository;