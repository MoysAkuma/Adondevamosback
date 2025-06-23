import cataloguesClient from '../config/supabase';
import ApiError from  '../utils/apiError'
import ApiResponse from  '../utils/apiResponse'

//create crountry
exports.createCountry = async (req, res, next) => {
  try{
    //GetrqBody
    const { name, originalname, acronym, hide } = req.body;
    const { data: ncountry, error } = await cataloguesClient
    .insert(
    {
        name: name, 
        originalname : originalname,
        acronym : acronym,
        enabled : true,
        hide : hide
    })
    .select();
    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success('Creation process sucess', ncountry, 201);
  } catch(err){
    next(err);
  } 
};

exports.getCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    const { data: country, error } = await cataloguesClient
      .from('countries')
      .select("*")
      .eq('id',CountryID);
    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Reading process sucess', 
      country);
  } catch (error) {
    next(err);
  }
};

exports.updateCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    //GetrqBody
    const { name, originalname, acronym, enabled, hide } = req.body;
    const { data: country, error } = await cataloguesClient
    .update(
    {
        name: name, 
        originalname : originalname,
        acronym : acronym,
        enabled : enabled,
        hide : hide
    })
    .eq('id',CountryID)
    .select();

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Reading process sucess', 
      country);

  } catch (error) {
    next(err);
  }
};

exports.deleteCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    const { data: country, error } = await cataloguesClient
    .from('countries')
    .delete()
    .eq('id', CountryID);

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Deletin process sucess', 
      country);
  } catch (error) {
    next(err);
  }
};

//Get all countries
exports.getAllCountries = async (req, res) => {
  const page = parseInt(req.query.page) || 10;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try{
    const { data: countries, error } = await cataloguesClient
    .from('countries')
    .select()
    .limit(limit)
    .skip(skip);
    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Reading process sucess', 
      countries);
  } catch(err){
    next(err);
  }   
};

exports.hideCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    const { data: country, error } = await cataloguesClient
    .from('countries')
    .update({
        hide : true
    })
    .eq('id', CountryID)
    .select("hide");
    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Country was hidden', 
      country);
  } catch (error) {
    next(err);
  }
};

exports.showCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    const { data: country, error } = await cataloguesClient
    .from('countries')
    .update({
        hide : false
    })
    .eq('id', CountryID)
    .select("hide");

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Country was hidden', 
      country);
  } catch (error) {
    next(err);
  }
};