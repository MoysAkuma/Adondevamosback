import express from 'express';
import placesController from '../controllers/places.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();
    router.get('/Places/:PlaceID', 
        placesController.getPlaceByID);

    router.post('/Places/Search',
        placesController.searchPlaces);

    router.get('/Places/Search/:field/:name',
        placesController.searchPlacesByField);

    router.post('/Places/:PlaceID/Images',
        authenticate,
        placesController.uploadImages);

    router.post('/Places',
        authenticate,
        placesController.createPlace);

    router.put('/Places/:PlaceID',
        authorizeAdmin,
        placesController.updatePlace);

    router.put('/Places/:PlaceID/Facilities',
        authenticate,
        placesController.updateFacilities);
        
    router.post('/Places/:PlaceID/Facilities',
        authenticate,
        placesController.addFacilities);
        
    router.get('/Places/lasted/:limit?',
        placesController.getNewPlaces
    )
    
    router.delete('/Places/:PlaceID/Images/:ImageID',
        authorizeAdmin,
        placesController.deleteImage
    )
    
    router.put('/Places/:PlaceID/Images/:ImageID/SetCover',
        authorizeAdmin,
        placesController.setCoverImage
    )

export default router;