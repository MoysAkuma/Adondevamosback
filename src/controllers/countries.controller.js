import {ApiError} from  '../utils/apiError.js'
import {ApiResponse} from  '../utils/apiResponse.js'
import countriesService from '../services/countries.service.js'

//create crountry
const createCountry = async (req, res, next) => {
  try{
    //GetrqBody
    const { name, originalname, acronym, hide } = req.body;
    const data = await countriesService.createCountry({
        name: name, 
        originalname : originalname,
        acronym : acronym,
        enabled : true,
        hide : hide
    });
    
    if (data.status != 201) throw new ApiError(500,error.message);
    new ApiResponse(res).success('Creation process sucess', data, data.status);
  } catch(err){
    next(err);
  } 
};

const getCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    const country = countriesService.getCountryById(CountryID);
    
    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Reading process sucess', 
      country);
  } catch (err) {
    next(err);
  }
};

const updateCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    //GetrqBody
    const { name, originalname, acronym, enabled, hide } = req.body;

    const editedcountry = await countriesService.updateCountry(CountryID, {
        name: name, 
        originalname : originalname,
        acronym : acronym,
        enabled : enabled,
        hide : hide
    });

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Updating Data sucess', 
      editedcountry);

  } catch (err) {
    next(err);
  }
};

const deleteCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    const resp = await countriesService.deleteCountry(CountryID);

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Deletin process sucess', 
      resp);
  } catch (err) {
    next(err);
  }
};

//Get all countries
const getAllCountries = async (req, res) => {
  const page = parseInt(req.query.page) || 10;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try{
    const countries = await countriesService.getAll(page, limit, skip);
    console.log(countries);
    if(countries.status != 200){
      return ApiError(countries.message, countries.status )
    }
    return new ApiResponse(res).success(
      'Reading all countries', 
      countries.data);
  } catch(err){
    return new ApiError(err.message, err.status);
  }   
};

const hideCountrybyID = async (req, res, next) => {
  try {
    //Get country id to search
    const { CountryID } = req.params;
    
    const hideresp = countriesService.setVisibilityCountry(CountryID, false);

    if (error) throw new ApiError(500,error.message);
    new ApiResponse(res).success(
      'Country was hidden', 
      hideresp);
  } catch (err) {
    next(err);
  }
};

const showCountrybyID = async (req, res, next) => {
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
  } catch (err) {
    next(err);
  }
};

const countryController = {
  createCountry,
  getCountrybyID,
  updateCountrybyID,
  deleteCountrybyID,
  getAllCountries,
  hideCountrybyID,
  showCountrybyID
};

export default countryController;