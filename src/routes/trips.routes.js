import express from 'express';
import tripsController from '../controllers/trips.controller.js'

const router = express.Router();

/**
 * @swagger
 * /Trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: A list of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/models/schemas/Trip'
 */
router.get('/Trips', 
    tripsController.getAllTrips);

/**
 * @swagger
 * /Trips/{TripID}:
 *   get:
 *     summary: Get a trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         description: The ID of the trip to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A trip object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetTripByIDRs'
 */
router.get('/Trips/:TripID', 
    tripsController.getTripbyID);
/**
 * @swagger
 * /Trips/{TripID}:
 *  put:
 *   summary: Update a trip by ID
 *   tags: [Trips]
 *   parameters:
 *     - in: path
 *       name: TripID
 *       required: true
 *       description: The ID of the trip to update
 *       schema:
 *         type: string
 *   requestBody:
 *     required: true
 *     content:
 *       application/json:
 *         schema:
 *           $ref: '#/components/schemas/Trip'
 *   responses:
 *     200:
 *       description: The updated trip object
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trip'
 */
router.put('/Trips/:TripID', 
    tripsController.updateTripbyID);
/**
 * @swagger
 * /Trips/{TripID}:
 *   delete:
 *     summary: Delete a trip by ID
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: TripID
 *         required: true
 *         description: The ID of the trip to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/Trips/:TripID', 
    tripsController.deleteTripbyID);

/**
 * @swagger
 * /Trips:
 *   post:
 *    summary: Create a new trip
 *   tags: [Trips]
 *   requestBody:
 *    required: true
 *   content:
 *    application/json:
 *     schema:
 *     $ref: '#/components/schemas/Trip'
 *  responses:
 *    201:
 *    description: The created trip object
 *   content:
 *    application/json:
 *    schema:
 *    $ref: '#/components/schemas/Trip'
 *  409:
 *  description: Creation failed
 * content:
 *  application/json:
 *   schema:
 *   type: object
 *  items: 
 *   type: string
 *  
 */
router.post('/Trips', 
    tripsController.createTrip);

export default router;