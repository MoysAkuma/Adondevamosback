import express from 'express';
import cataloguesController from '../controllers/catalogues.controller.js'

const router = express.Router();

router.get('/Catalogues/all', 
    cataloguesController.getAllCatalogues);

export default router;
