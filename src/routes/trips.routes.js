import express from 'express';
import tripsController from '../controllers/trips.controller.js'

const router = express.Router();

router.get('/Trips', 
    tripsController.getAllTrips);

router.get('/Trips/:TripID', 
    tripsController.getTripbyID);
router.put('/Trips/:TripID', 
    tripsController.updateTripbyID);

router.delete('/Trips/:TripID', 
    tripsController.deleteTripbyID);

router.post('/Trips', 
    tripsController.createTrip);

router.get('/Trips/View/New',
    tripsController.getNewTrips);

router.post('/Trips/Search',
    tripsController.searchTrips);
export default router;