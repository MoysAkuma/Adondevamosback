const express = require('express');
const router = express.Router();
const countryController = require('../controllers/contriesController');
const { validateCreateUser } = require('../validations/contriesValidations');
/**
 * @swagger
 * /Country:
 *   post:
 *     summary: Retrieve a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 */

/**
 * @swagger
 * /Country:
 *   post:
 *     summary: Create a country
 *     responses:
 *       200:
 *         description: A json response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 type: string
 *                 example: Created 
 */
router.post('/Countries', countriesController.createCountries);

/*app.post("/Countries", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, originalname, acronym, hide } = req.body;
        const message = req.body.message;

        const { data, error } = await adminCataloguesclient.from('countries')
        .insert(
            {
                name: name, 
                originalname : originalname,
                acronym : acronym,
                enabled : true,
                hide : hide
            })
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(201).json({
                "Message": "Creation process sucess", "info":data
            });
        }
    } catch (err){
        next(err);
    }
});
*/

/*
    Method: Read country Type: GET
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.get("/Countries/:CountryID", countriesController.getCountrybyID);
/*app.get("/Country/:CountryID", async(req, res, next) => {
    try{
        //Get country id to search
        const { CountryID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('countries')
        .select("id, name, originalname, acronym, enabled, hide")
        .eq('id',CountryID);

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Reading process sucess", "info":data
            });
        }
    } catch (err){
        next(err);
    }
});
*/

/*
    Method: Update country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.put("/Countries/:CountryID", countriesController.updateCountrybyID);
/*app.put("/Country/:CountryID", async(req, res, next) => {
    try{
        //Get country id to search
        const { CountryID } = req.params;
        //GetrqBody
        const { name, originalname, acronym, enabled, hide } = req.body;
        const message = req.body.message;

        const { data, error } = await adminCataloguesclient.from('countries')
        .update(
            {
                name: name, 
                originalname : originalname,
                acronym : acronym,
                enabled : enabled,
                hide : hide
            })
        .eq('id',CountryID)
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Edition process sucess", "info":data
            });
        }
    } catch (err){
        next(err);
    }
});
*/
/*
    Method: Delete country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.delete("/Countries/:CountryID", countriesController.deleteCountrybyID);
/*app.delete("/Country/:CountryID", async(req, res, next) => {
    try{
        //Get country id to search
        const { CountryID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('countries')
        .delete()
        .eq('id', CountryID);

        if (error) throw res.status(500).json(error);
        res.status(200);
    } catch (err){
        next(err);
    }
});
*/

/*
    Method: Hide a Country form system
    In : Json - Out : Json
    Date: 11/06/2025
*/
router.patch("/Countries/:CountryID/Hide", countriesController.hideCountrybyID);
/*app.patch("/Country/:CountryID/Hide", async(req, res, next) =>{
    try{
        //Get country id to search
        const { CountryID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('countries')
        .update( { hide : true})
        .eq('id', CountryID)
        .select("hide");

        if (error) throw res.status(500).json(error);
        res.status(200).json(data);
    } catch (err){
        next(err);
    }
}
);
*/
/*
    Method: Show a Country that is hidden
    In : Json - Out : Json
    Date: 11/06/2025
*/
router.patch("/Countries/:CountryID/Hide", countriesController.showCountrybyID);
/*app.patch("/Country/:CountryID/Show", async(req, res, next) =>{
    try{
        //Get country id to search
        const { CountryID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('countries')
        .update({
            hide : false
        })
        .eq('id', CountryID).select("hide");

        if (error) throw res.status(500).json(error);
        res.status(200).json(data);
    } catch (err){
        next(err);
    }
}
);
*/

/*
    Method: get all countries Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
router.get("/Countries", countriesController.getAllCountries);
/*app.get("/Countries", async(req, res, next) => {
    try{
        const { data, error } = await adminCataloguesclient
        .from('countries')
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Reading process sucess", "info":data
            });
        }
    } catch (err){
        console.log(err);
        next(err);
    }
});
*/
module.exports = router;