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
    const { data, error } = await this.userClient
        .from('users')
        .select("id")
        .eq(field, value);
    if (error) return { status: 500, error: error.message };
    if (data.length === 0) return { status: 404, error: "User not found" };

    return { status: 200 };
  }
};

export default usersRepository;