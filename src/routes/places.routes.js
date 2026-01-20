import express from 'express';
import placesController from '../controllers/places.controller.js';

const router = express.Router();

    router.get('/Places/:PlaceID', 
        placesController.getPlaceByID);

    router.post('/Places/Search',
        placesController.searchPlaces);

    router.get('/Places/Search/:field/:name',
        placesController.searchPlacesByField);

    router.post('/Places/:PlaceID/Images',
        placesController.uploadImages);

    router.post('/Places',
        placesController.createPlace);

    router.put('/Places/:PlaceID',
        placesController.updatePlace);

    router.put('/Places/:PlaceID/Facilities',
        placesController.updateFacilities);
        
    router.post('/Places/:PlaceID/Facilities',
        placesController.addFacilities);
        
    router.get('/Places/lasted/:limit?',
        placesController.getNewPlaces
    )

export default router;