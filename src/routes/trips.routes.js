import express from 'express';
import tripsController from '../controllers/trips.controller.js'
import { authenticate } from '../middleware/auth.middleware.js';

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
 *    schemas:
 *      Country:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *          acronym:
 *            type: string
 *      State:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *      City:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *      Place:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *          Country:
 *            $ref: '#/components/schemas/Country'
 *          State:
 *            $ref: '#/components/schemas/State'
 *          City:
 *            $ref: '#/components/schemas/City'
 *      ItineraryItem:
 *        type: object
 *        properties:
 *          initialdate:
 *            type: string
 *            format: date
 *          finaldate:
 *            type: string
 *            format: date
 *          place:
 *            $ref: '#/components/schemas/Place'
 *      User:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *          lastname:
 *            type: string
 *          email:
 *            type: string
 *          tag:
 *            type: string
 *      Member:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          hide:
 *            type: boolean
 *          userid:
 *            type: integer
 *          user:
 *            $ref: '#/components/schemas/User'
 *      TripVotes:
 *        type: object
 *        properties:
 *          Total:
 *            type: integer
 *      TripStatics:
 *        type: object
 *        properties:
 *          Votes:
 *            $ref: '#/components/schemas/TripVotes'
 *      GalleryItem:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          filename:
 *            type: string
 *          completeurl:
 *            type: string
 *            format: uri
 *      Trip:
 *        type: object
 *        required:
 *          - id
 *          - name
 *          - description
 *          - initialdate
 *          - finaldate
 *          - isinternational
 *          - owner
 *          - statics
 *        properties:
 *          id:
 *            type: integer
 *            description: The auto-generated id of the trip
 *          name:
 *            type: string
 *            description: The name of the trip
 *          description:
 *            type: string
 *            description: The description of the trip
 *          isinternational:
 *            type: boolean
 *            description: Indicates if the trip is international
 *          itinerary:
 *            type: array
 *            description: The itinerary of the trip
 *            items:
 *              $ref: '#/components/schemas/ItineraryItem'
 *          owner:
 *            description: The owner of the trip
 *            $ref: '#/components/schemas/User'
 *          members:
 *            type: array
 *            description: The members of the trip
 *            items:
 *              $ref: '#/components/schemas/Member'
 *          statics:
 *            description: The statistics of the trip
 *            $ref: '#/components/schemas/TripStatics'
 *          userVoted:
 *            type: boolean
 *            description: Indicates if authenticated user already voted the trip
 *          gallery:
 *            type: array
 *            description: The trip gallery images
 *            items:
 *              $ref: '#/components/schemas/GalleryItem'
 *          TripByIdResponse:
 *              type: object
 *              properties:
 *                  message:
 *                      type: string
 *                      example: Reading process sucess
 *                  info:
 *                      $ref: '#/components/schemas/Trip'
 */

/**
 * @swagger
 * /Trips:
 *   get:
 *    summary: Returns the list of all the trips
 *    tags: [Trips]
 *    responses:
 *      200:
 *        description: The list of trips
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Trip'
 *      500:
 *        description: Internal server error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Internal server error
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
 *         description: Trip data by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TripByIdResponse'
 *             example:
 *               message: Reading process sucess
 *               info:
 *                 id: 1
 *                 name: Nihon Trip 2024
 *                 description: First time at japan, itinerary made by Luis hongo and site by MoysAkuma
 *                 initialdate: '2024-02-02'
 *                 finaldate: '2024-02-17'
 *                 isinternational: false
 *                 itinerary:
 *                   - initialdate: '2024-02-04'
 *                     finaldate: '2024-02-04'
 *                     place:
 *                       id: 3
 *                       name: Naritasan Shinsho-ji
 *                       Country:
 *                         id: 2
 *                         name: Japan
 *                         acronym: JP
 *                       State:
 *                         id: 6
 *                         name: Tokyo
 *                       City:
 *                         id: 3
 *                         name: Tokyo
 *                 owner:
 *                   id: 3
 *                   name: Moises
 *                   lastname: Moran
 *                   email: moises141294@hotmail.com
 *                   tag: MoysAkuma
 *                 members:
 *                   - id: 9
 *                     hide: false
 *                     userid: 11
 *                     user:
 *                       id: 11
 *                       name: Luis
 *                       lastname: Sotelo
 *                       email: Luisonhongon@gmail.com
 *                       tag: LuisHongoFake
 *                 statics:
 *                   Votes:
 *                     Total: 2
 *                 userVoted: false
 *                 gallery:
 *                   - id: 1
 *                     filename: trips/1_1768516117989_0.jpg
 *                     completeurl: https://hdezhwbanmxalxabzisy.supabase.co/storage/v1/object/public/adondevamosNoGallery/trips/1_1768516117989_0.jpg
 *       404:
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip not found
 *                 status:
 *                   type: string
 *                   example: error
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 */
router.get('/Trips/:TripID', 
    tripsController.getTripbyID);

router.put('/Trips/:TripID', 
    authenticate,
    tripsController.updateTripbyID);

router.post('/Trips', 
    authenticate,
    tripsController.createTrip);

router.post('/Trips/Search',
    tripsController.searchTrips);

router.post('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.createItinerary);

router.put('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.updateItinerary);

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

router.delete('/Trips/:TripID/Images/:ImageID',
    authenticate,
    tripsController.deleteImage);
    
export default router;