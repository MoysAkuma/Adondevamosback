import express from 'express';
import placesController from '../controllers/places.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware.js';
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Places
 *   description: The places managing API
 * */
/** 
 * @swagger
 *  components:
 *    schemas:
 *      ErrorResponse:
 *        type: object
 *        properties:
 *          error:
 *            type: string
 *          message:
 *            type: string
 *      CreatePlaceRequest:
 *        type: object
 *        required:
 *          - name
 *          - countryid
 *          - stateid
 *          - cityid
 *          - description
 *          - address
 *          - latitude
 *          - longitude
 *        properties:
 *          name:
 *            type: string
 *          countryid:
 *            type: integer
 *          stateid:
 *            type: integer
 *          cityid:
 *            type: integer
 *          description:
 *            type: string
 *          address:
 *            type: string
 *          ispublic:
 *            type: boolean
 *            default: false
 *          latitude:
 *            type: number
 *          longitude:
 *            type: number
 *      CreatePlaceRs:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *          info:
 *            type: object
 *            properties:
 *              id:
 *                type: integer
 *      PlaceFacility:
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          code:
 *            type: string
 *      PlaceGalleryItem:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          filename:
 *            type: string
 *          completeurl:
 *            type: string
 *            format: uri
 *      Place:
 *        type: object
 *        properties:
 *          id:
 *            type: integer
 *          name:
 *            type: string
 *          description:
 *            type: string
 *          ispublic:
 *            type: boolean
 *          address:
 *            type: string
 *          latitude:
 *            type: string
 *          longitude:
 *            type: string
 *          Country:
 *            $ref: '#/components/schemas/Country'
 *          State:
 *            $ref: '#/components/schemas/State'
 *          City:
 *            $ref: '#/components/schemas/City'
 *          facilities:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/PlaceFacility'
 *          statics:
 *            type: object
 *          userVote:
 *            type: boolean
 *          gallery:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/PlaceGalleryItem'
 *      PlaceSearchRs:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *          info:
 *            type: array
 *            items:
 *              $ref: '#/components/schemas/Place'
 *      PlaceByIDrs:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *          info:
 *            $ref: '#/components/schemas/Place'
 *  
 */

/**
 * @swagger
 *  /Places/{PlaceID}:
 *    get:
 *      summary: Get a place by ID
 *      tags: [Places]
 *      parameters:
 *        - in: path
 *          name: PlaceID
 *          required: true
 *          schema:
 *            type: string
 *            description: The ID of the place
 *      responses:
 *        200:
 *          description: The place was successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/PlaceByIDrs'
 *        404:
 *          description: Place not found
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *        500:
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *          
 * 
 */

/**
 * @swagger
 *  /Places:
 *    post:
 *      summary: Create a place
 *      tags: [Places]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CreatePlaceRequest'
 *      responses:
 *        201:
 *          description: Place created successfully
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CreatePlaceRs'
 *        400:
 *          description: Invalid create place payload
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *        401:
 *          description: Unauthorized
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *        403:
 *          description: Admin access required
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
    router.post('/Places',
        authenticate,
        authorizeAdmin,
        placesController.createPlace);
        
    router.get('/Places/:PlaceID', 
        placesController.getPlaceByID);

    router.post('/Places/Search',
        placesController.searchPlaces);

    router.get('/Places/Search/:field/:name',
        placesController.searchPlacesByField);

    router.post('/Places/:PlaceID/Images',
        authenticate,
        placesController.uploadImages);



    router.put('/Places/:PlaceID',
        authenticate,
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
        authenticate,
        authorizeAdmin,
        placesController.deleteImage
    )

export default router;