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
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Place not found
 *                  status:
 *                    type: string
 *                    example: 404
 *          
 * 
 */
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