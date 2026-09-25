class LocationsRepository {
  constructor({ cataloguesClient }) {
    // Inicializar la conexión a la base de datos o cualquier otra configuración necesaria
    this.cataloguesClient = cataloguesClient;
  }

  async getLocation(type, id) {

    let query = 
    this.cataloguesClient.
    from(type).select('name, id').eq('id', id);
    let { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return data ? data[0] : null;
  }

  
}

export { LocationsRepository };