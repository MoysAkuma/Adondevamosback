import express from 'express';
import tripsController from '../controllers/trips.controller.js'

const router = express.Router();
/** 
 * @swagger
 * tags:
 *   name: Trips
 *   description: The trips managing API
 */
/**
 * @swagger
 *  components:
 *      schemas:
 *          Trip:
 *              type: object
 *              required:
 *                  - name
 *                  - description
 *                  - initialdate
 *                  - finaldate
 *                  - isinternational
 *                  - owner
 *                  - statics
 *              properties:
 *                  id:
 *                      type: string
 *                      description: The auto-generated id of the trip
 *                  name:
 *                      type: string
 *                      description: The name of the trip
 *                  description:
 *                      type: string
 *                      description: The description of the trip
 *                  initialdate:
 *                      type: string
 *                      format: date
 *                      description: The start date of the trip
 *                  finaldate:
 *                      type: string
 *                      format: date
 *                      description: The end date of the trip
 *                  isinternational:
 *                      type: boolean
 *                      description: Indicates if the trip is international
 *                  owner:
 *                      type: object
 *                      description: The owner of the trip
 *                      properties:
 *                          id:
 *                              type: string
 *                              description: The ID of the owner
 *                          name:
 *                              type: string
 *                              description: The name of the owner
 *                          lastname:
 *                              type: string
 *                              description: The last name of the owner
 *                          email:
 *                              type: string
 *                              description: The email of the owner
 *                          tag:
 *                              type: string
 *                              description: The tag of the owner
 *                  statics:
 *                      type: object
 *                      description: The statistics of the trip
 *                      properties:
 *                          Votes:
 *                              type: integer
 *                              description: Number of votes
 *                  Members:
 *                      type: array
 *                      description: The members of the trip
 *                      items:
 *                          type: object
 *                          schema: "$ref: '#/components/schemas/Member'"
 *                  Itinerary:
 *                      type: array
 *                      description: The itinerary of the trip
 *                      items:
 *                          type: object
 *                          schema: "$ref: '#/components/schemas/Visit'"
 * 
 */


router.get('/Trips', 
    tripsController.getAllTrips);
/**
 * @swagger
 * /Trips/{TripID}:
 *   get:
 *     summary: Returns the trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The list of the trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 */
router.get('/Trips/:TripID', 
    tripsController.getTripbyID);

router.put('/Trips/:TripID', 
    tripsController.updateTripbyID);

router.delete('/Trips/:TripID', 
    tripsController.deleteTripbyID);

router.post('/Trips', 
    tripsController.createTrip);

router.post('/Trips/Search',
    tripsController.searchTrips);

router.post('/Trips/:TripID/Itinerary',
    tripsController.createItinerary);

router.put('/Trips/:TripID/Itinerary',
    tripsController.updateItinerary);

router.post('/Trips/:TripID/Members',
    tripsController.createMemberList);

router.put('/Trips/:TripID/Members',
    tripsController.updateMemberList);

router.get('/Trips/lasted/:Limit?',
    tripsController.getNewTrips);

router.post('/Trips/:TripID/Images',
    tripsController.uploadImages);

router.delete('/Trips/:TripID/Images/:ImageID',
    tripsController.deleteImage);
    
export default router;