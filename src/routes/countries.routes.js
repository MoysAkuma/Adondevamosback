import express from 'express';
import countryController from '../controllers/countries.controller.js'

const router = express.Router();
/**
 * @swagger
 * /Countries:
 *   post:
 *     summary: Create a country
 *     description: This request creates a new entity Country
 *     responses:
 *       201:
 *         description: New country created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 type: string
 *                 example: Created 
 */
router.post('/Countries', 
    countryController.createCountry);

/*
    Method: Read country Type: GET
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.get("/Countries/:CountryID", 
    countryController.getCountrybyID);

/*
    Method: Update country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.put("/Countries/:CountryID", 
    countryController.updateCountrybyID);

/*
    Method: Delete country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.delete("/Countries/:CountryID", 
    countryController.deleteCountrybyID);

/*
    Method: Hide a Country form system
    In : Json - Out : Json
    Date: 11/06/2025
*/
router.patch("/Countries/:CountryID/Hide", 
    countryController.hideCountrybyID);
/*
    Method: Show a Country that is hidden
    In : Json - Out : Json
    Date: 11/06/2025
*/
router.patch("/Countries/:CountryID/Show", 
    countryController.showCountrybyID);

/*
    Method: get all countries Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.get("/Countries", 
    countryController.getAllCountries);

export default countryRoutes = router;