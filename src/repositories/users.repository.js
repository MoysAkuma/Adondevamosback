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
        .select("id, email, name, lastname, tagid, password")
        .eq('email', email);
    if (error) return { status: 500, error: error.message };
    return { status: 200, data: data };
  }
};

export default usersRepository;