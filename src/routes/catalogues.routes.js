import express from 'express';
import cataloguesController from '../controllers/catalogues.controller.js'
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware.js';
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
    authorizeAdmin,
cataloguesController.createCatalogueOption);

router.patch('/Catalogues/:option/:id',
    authorizeAdmin,
cataloguesController.updateCatalogueOption);

export default router;
