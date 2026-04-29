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
 *      TripByIdResponse:
 *         type: object
 *         properties:
 *             message:
 *                 type: string
 *                 example: Reading process sucess
 *             info:
 *                      $ref: '#/components/schemas/Trip'
 *      CreateTripRq:
 *        type: object
 *        required:
 *          - name
 *          - description
 *          - initialdate
 *          - finaldate
 *          - isinternational
 *        properties:
 *          name:
 *            type: string
 *            description: The name of the trip
 *          description:
 *            type: string
 *            description: The description of the trip
 *          initialdate:
 *            type: string
 *            format: date
 *            description: The start date of the trip
 *          finaldate:
 *            type: string
 *            format: date
 *            description: The end date of the trip
 *          isinternational:
 *            type: boolean
 *            description: Indicates if the trip is international
 *      CreateTripRs:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            example: Trip created successfully
 *          info:
 *            $ref: '#/components/schemas/Trip'
 * */

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
 *       - in: query
 *         name: fields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include (e.g., "owner,itinerary,members,statics,userVoted,gallery"). Omit to get all fields.
 *         example: "owner,itinerary,statics"
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


/**
 * @swagger
 * /Trips:
 *   post:
 *     summary: Creates a new trip
 *     tags: [Trips, Creation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTripRq'
 *     responses:
 *       201:
 *         description: Trip created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreaterTripRs'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *          
 */
router.post('/Trips', 
    authenticate,
    tripsController.createTrip);

/**
 * @swagger
 * /Trips/{TripID}:
 *   put:
 *     summary: Updates a trip by ID
 *     tags: [Trips, Update]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTripRq'
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateTripRs'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 */
router.put('/Trips/:TripID', 
    authenticate,
    tripsController.updateTripbyID);

/**
 * @swagger
 * /Trips/{TripID}:
 *   delete:
 *     summary: Deletes a trip by ID
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip to delete
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Deletion process success
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip not found
 */
router.delete('/Trips/:TripID',
    authenticate,
    tripsController.deleteTripbyID);

/**
 * @swagger
 * /Trips/Search:
 *   post:
 *     summary: Search trips with filters
 *     tags: [Trips]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Search by trip name (partial match)
 *                   initialdate:
 *                     type: string
 *                     format: date
 *                     description: Filter trips starting from this date
 *                   finaldate:
 *                     type: string
 *                     format: date
 *                     description: Filter trips ending before this date
 *                   countryid:
 *                     type: integer
 *                     description: Filter by country ID in itinerary
 *                   stateid:
 *                     type: integer
 *                     description: Filter by state ID in itinerary
 *                   cityid:
 *                     type: integer
 *                     description: Filter by city ID in itinerary
 *                   mytrips:
 *                     type: boolean
 *                     description: Filter trips created by authenticated user
 *                   membertrips:
 *                     type: boolean
 *                     description: Filter trips where user is a member
 *           example:
 *             filters:
 *               name: "Japan"
 *               countryid: 2
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Search trips success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *       404:
 *         description: No results to show
 */
router.post('/Trips/Search',
    tripsController.searchTrips);

/**
 * @swagger
 * /Trips/{TripID}/Itinerary:
 *   post:
 *     summary: Create itinerary for a trip
 *     tags: [Trips, Itinerary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Itinerary:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - placeid
 *                     - initialdate
 *                     - finaldate
 *                   properties:
 *                     placeid:
 *                       type: integer
 *                       description: The ID of the place
 *                     initialdate:
 *                       type: string
 *                       format: date
 *                       description: Start date for this place
 *                     finaldate:
 *                       type: string
 *                       format: date
 *                       description: End date for this place
 *           example:
 *             Itinerary:
 *               - placeid: 3
 *                 initialdate: "2024-02-04"
 *                 finaldate: "2024-02-04"
 *               - placeid: 5
 *                 initialdate: "2024-02-05"
 *                 finaldate: "2024-02-06"
 *     responses:
 *       201:
 *         description: Itinerary created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Itinerary creation process success
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip not found
 */
router.post('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.createItinerary);

/**
 * @swagger
 * /Trips/{TripID}/Itinerary:
 *   put:
 *     summary: Update itinerary for a trip (replaces existing itinerary)
 *     tags: [Trips, Itinerary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Itinerary:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - placeid
 *                     - initialdate
 *                     - finaldate
 *                   properties:
 *                     placeid:
 *                       type: integer
 *                       description: The ID of the place
 *                     initialdate:
 *                       type: string
 *                       format: date
 *                       description: Start date for this place
 *                     finaldate:
 *                       type: string
 *                       format: date
 *                       description: End date for this place
 *           example:
 *             Itinerary:
 *               - placeid: 3
 *                 initialdate: "2024-02-04"
 *                 finaldate: "2024-02-05"
 *               - placeid: 8
 *                 initialdate: "2024-02-06"
 *                 finaldate: "2024-02-07"
 *     responses:
 *       201:
 *         description: Itinerary updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Itinerary update process success
 *       403:
 *         description: Only trip creator or members can perform this action
 *       404:
 *         description: Trip not found
 */
router.put('/Trips/:TripID/Itinerary',
    authenticate,
    tripsController.updateItinerary);

/**
 * @swagger
 * /Trips/{TripID}/Members:
 *   post:
 *     summary: Add members to a trip
 *     tags: [Trips, Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - userid
 *                   properties:
 *                     userid:
 *                       type: integer
 *                       description: The ID of the user to add as member
 *                     hide:
 *                       type: boolean
 *                       description: Whether to hide the member from public view
 *                       default: false
 *           example:
 *             Members:
 *               - userid: 11
 *                 hide: false
 *               - userid: 15
 *                 hide: true
 *     responses:
 *       201:
 *         description: Members added successfully (emails sent to added members)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Member list creation process success
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip not found
 */
router.post('/Trips/:TripID/Members',
    authenticate,
    tripsController.createMemberList);

/**
 * @swagger
 * /Trips/{TripID}/Members:
 *   put:
 *     summary: Update member list of a trip (replaces existing members)
 *     description: Updates the trip member list. Sends email notifications to added and removed members.
 *     tags: [Trips, Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Members:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - userid
 *                   properties:
 *                     userid:
 *                       type: integer
 *                       description: The ID of the user
 *                     hide:
 *                       type: boolean
 *                       description: Whether to hide the member from public view
 *                       default: false
 *           example:
 *             Members:
 *               - userid: 11
 *                 hide: false
 *               - userid: 20
 *                 hide: false
 *     responses:
 *       201:
 *         description: Member list updated successfully (emails sent to added/removed members)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Member list update process success
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip not found
 */
router.put('/Trips/:TripID/Members',
    authenticate,
    tripsController.updateMemberList);

/**
 * @swagger
 * /Trips/lasted/{Limit}:
 *   get:
 *     summary: Get the newest/latest trips
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: Limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Maximum number of trips to return
 *       - in: query
 *         name: fields
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include (e.g., "owner,itinerary,members,statics,userVoted,gallery")
 *         example: "owner,itinerary,statics"
 *     responses:
 *       200:
 *         description: List of newest trips
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reading news trips success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trip'
 *       500:
 *         description: Internal server error
 */
router.get('/Trips/lasted/:Limit?',
    tripsController.getNewTrips);

/**
 * @swagger
 * /Trips/{TripID}/Images:
 *   post:
 *     summary: Upload images to trip gallery
 *     tags: [Trips, Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - data
 *                   properties:
 *                     data:
 *                       type: string
 *                       description: Base64 encoded image data or data URL
 *                       example: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *                     mimetype:
 *                       type: string
 *                       description: MIME type of the image
 *                       default: image/jpeg
 *                       example: image/jpeg
 *                     extension:
 *                       type: string
 *                       description: File extension
 *                       default: jpg
 *                       example: jpg
 *           example:
 *             images:
 *               - data: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 *                 mimetype: "image/jpeg"
 *                 extension: "jpg"
 *               - data: "/9j/4AAQSkZJRg..."
 *                 mimetype: "image/png"
 *                 extension: "png"
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Images uploaded successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       filename:
 *                         type: string
 *                       completeurl:
 *                         type: string
 *       400:
 *         description: Bad request - missing or invalid images
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip not found
 */
router.post('/Trips/:TripID/Images',
    authenticate,
    tripsController.uploadImages);

/**
 * @swagger
 * /Trips/{TripID}/Images/{ImageID}:
 *   delete:
 *     summary: Delete an image from trip gallery
 *     tags: [Trips, Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *       - in: path
 *         name: ImageID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     imageId:
 *                       type: integer
 *                     filename:
 *                       type: string
 *       400:
 *         description: Bad request - ImageID is required
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip or image not found
 */
router.delete('/Trips/:TripID/Images/:ImageID',
    authenticate,
    tripsController.deleteImage);

/**
 * @swagger
 * /Trips/{TripID}/Images/{ImageID}/SetCover:
 *   put:
 *     summary: Set an image as the trip cover image
 *     tags: [Trips, Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the trip
 *       - in: path
 *         name: ImageID
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the image to set as cover
 *     responses:
 *       200:
 *         description: Cover image set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cover image set successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Cover image updated
 *       400:
 *         description: Bad request - ImageID is required
 *       403:
 *         description: Only admin or trip creator can perform this action
 *       404:
 *         description: Trip or image not found
 */
router.put('/Trips/:TripID/Images/:ImageID/SetCover',
    authenticate,
    tripsController.setCoverImage);
    
export default router;