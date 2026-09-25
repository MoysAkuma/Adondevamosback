import express from 'express';
import tripsController from '../controllers/trips.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/Trips',
    tripsController.getAllTrips);
router.get('/Trips/owner/:UserId',
    tripsController.getTripsByOwner);

router.get('/Trips/:TripID', 
    tripsController.getTripbyID);


router.post('/Trips', 
    authenticate,
    tripsController.createTrip);

router.put('/Trips/:TripID', 
    authenticate,
    tripsController.updateTripbyID);

router.delete('/Trips/:TripID',
    authenticate,
    tripsController.deleteTripbyID);

router.post('/Trips/Search',
    tripsController.searchTrips);

router.post('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.createItinerary);

router.put('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.updateItinerary);

router.patch('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.addItineraryPlace);

router.post('/Trips/:TripID/Members',
    authenticate,
    tripsController.createMemberList);

router.put('/Trips/:TripID/Members',
    authenticate,
    tripsController.updateMemberList);

router.get('/Trips/lasted/:Limit?',
    tripsController.getNewTrips);

router.post('/Trips/:TripID/Images',
    authenticate,
    tripsController.uploadImages);

router.put('/Trips/:TripID/Images',
    authenticate,
    tripsController.updateImagesMetadata);

router.delete('/Trips/:TripID/Images/:ImageID',
    authenticate,
    tripsController.deleteImage);

router.put('/Trips/:TripID/Images/:ImageID/SetCover',
    authenticate,
    tripsController.setCoverImage);
    
export default router;
