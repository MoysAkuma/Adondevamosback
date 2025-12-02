import express from 'express';
import placesController from '../controllers/places.controller.js';

const router = express.Router();

router.get('/Places/:PlaceID', 
    placesController.getPlaceByID);

router.post('/Places/Search',
    placesController.searchPlaces);


export default router;