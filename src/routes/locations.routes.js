import express from 'express';
import locationsController from '../controllers/locations.controller.js';

const router = express.Router();

router.get('/locations/:type/:id', 
    locationsController.getLocation);

export default router;