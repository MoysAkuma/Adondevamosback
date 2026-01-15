import express from 'express';
import cataloguesController from '../controllers/catalogues.controller.js'

const router = express.Router();

router.get('/Catalogues/all', 
cataloguesController.getAllCatalogues);

router.get('/Catalogues/countries', 
cataloguesController.getAllCountries);

router.get('/Catalogues/states',
cataloguesController.getAllStates);

router.get('/Catalogues/cities',
cataloguesController.getAllCities);

router.get('/Catalogues/facilities',
cataloguesController.getAllFacilities);

router.post('/Catalogues/:option',
cataloguesController.createCatalogueOption);

router.patch('/Catalogues/:option/:id',
cataloguesController.updateCatalogueOption);

export default router;
