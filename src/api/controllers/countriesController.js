// controllers/countriesController.js
exports.createCountries = async (req, res) => {

};

exports.getAllCountries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try{
    const { data, error } = await adminCataloguesclient
        .from('countries')
        .select();-
  } catch(err){

  }   
  const countries = await Country.find().skip(skip).limit(limit);
  const total = await Country.countDocuments();
  
  res.json({
    data: countries,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};

exports.getCountrybyID = async (req, res) => {

};

exports.updateCountrybyID = async (req, res) => {

};

exports.deleteCountrybyID = async (req, res) => {

};

exports.hideCountrybyID = async (req, res) => {

};