import express from 'express';
import placesController from '../controllers/places.controller.js';

const router = express.Router();

router.get('/Places/:PlaceID', 
    placesController.getPlaceByID);

router.post('/Places/Search',
    placesController.searchPlaces);

router.get('/Places/Search/:name',
    placesController.searchPlacesByName);

export default router;