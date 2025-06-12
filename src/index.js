const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config(); 

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SERVICE_KEY;

//Swagger 
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const tripsclient = createClient(supabaseUrl, supabaseKey, {
   db: { schema: 'trips' }
});

const anonclientuser = createClient(supabaseUrl, supabaseKey, {
   db: { schema: 'users' }
});

const userclient = createClient(supabaseUrl,supabaseServiceKey , {
   db: { schema: 'users' }
});

const adminCataloguesclient = createClient(supabaseUrl,supabaseServiceKey , {
   db: { schema: 'catalogues' }
});

const CataloguesAnonclient = createClient(supabaseUrl,supabaseKey , {
   db: { schema: 'catalogues' }
});

//Configuraciones
app.set('port', process.env.PORT || 3001);
app.set('json spaces', 2)

// Middleware to parse JSON bodies
app.use(express.json());

// Or configure specific origins
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    myapi: '3.0.0',
    info: {
      title: 'Adondevamos.back',
      version: 'Alpha',
      description: 'Restful api to manage adondeveamos.web part of Adondevamos.io website',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
  },
  apis: ['routes/*.js'], // files containing annotations as above
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(process.env.PORT, () => {
 console.log("Adondevamos.back is running at 3000");
});

/*
    Method: Create country Type: POST
    In : Json - Out : Json
    Date: 13/05/2025
*/
app.post("/Country", async(req, res, next) => {
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
/*
    Method: Read country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Country/:CountryID", async(req, res, next) => {
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

/*
    Method: GetCountryNames Type: GET
    In : Json - Out : Json
    Date: 03/06/2025
*/
app.get("/Country/:CountryID", async(req, res, next) => {
    try{
        //Get country id to search
        const { CountryID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('countries')
        .select("name, originalname, acronym, enabled, hide")
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
/*
    Method: Update country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.put("/Country/:CountryID", async(req, res, next) => {
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
/*
    Method: Delete country Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.delete("/Country/:CountryID", async(req, res, next) => {
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

/*
    Method: Hide a Country form system
    In : Json - Out : Json
    Date: 11/06/2025
*/
app.patch("/Country/:CountryID/Hide", async(req, res, next) =>{
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

/*
    Method: Show a Country that is hidden
    In : Json - Out : Json
    Date: 11/06/2025
*/
app.patch("/Country/:CountryID/Show", async(req, res, next) =>{
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

/*
    Method: get all countries Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Countries", async(req, res, next) => {
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

/*
    Method: Create State Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.post("/State", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, originalname, countryid, enabled, hide } = req.body;
        const message = req.body.message;

        const { data, error } = await adminCataloguesclient
        .from('states')
        .insert(
            {
                name: name, 
                originalname : originalname,
                countryid : countryid,
                enabled : enabled,
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
/*
    Method: Read state Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/State/:StateID", async(req, res, next) => {
    try{
        //Get state id to search
        const { StateID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('states')
        .select("name, originalname, countryid, enabled, hide")
        .eq('id',StateID);
        

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
/*
    Method: Update state Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.put("/State/:stateID", async(req, res, next) => {
    try{
        //Get state id to search
        const { stateID } = req.params;
        //GetrqBody
        const { name, originalname, countryid, enabled, hide } = req.body;
        const message = req.body.message;

        const { data, error } = await adminCataloguesclient.from('states')
        .update(
            {
                name: name, 
                originalname : originalname,
                countryid : countryid,
                enabled : enabled,
                hide : hide
            })
        .eq('id',stateID)
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
/*
    Method: Delete state Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.delete("/State/:stateID", async(req, res, next) => {
    try{
        //Get state id to search
        const { stateID } = req.params;

        const resp = await adminCataloguesclient
        .from('states')
        .delete()
        .eq('id', stateID);

        if (resp.status == 500) throw res.status(500).json(error);
        res.status(resp.status);
    } catch (err){
        next(err);
    }
});
/*
    Method: Read all states Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/States", async(req, res, next) => {
    try{
        const { data, error } = await adminCataloguesclient
        .from('states')
        .select("name, originalname, countryid, enabled, hide");

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

/*
    Method: Read all states by countryid Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/States/ByCountryID/:countryid", async(req, res, next) => {
    try{
        //Get state id to search
        const { countryid } = req.params;
        const { data, error } = await adminCataloguesclient
        .from('states')
        .select("name, originalname, countryid, enabled, hide")
        .eq('countryid',countryid);

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

/*
    Method: Create city Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.post("/City", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, originalname, countryid,stateid, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('cities')
        .insert(
            {
                name: name, 
                originalname : originalname,
                countryid : countryid,
                stateid:stateid,
                enabled : enabled,
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

/*
    Method: Read city Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/City/:cityID", async(req, res, next) => {
    try{
        //Get state id to search
        const { cityID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('cities')
        .select("name, originalname, countryid,stateid, enabled, hide")
        .eq('id',cityID);

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
/*
    Method: Update city Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.put("/City/:cityID", async(req, res, next) => {
    try{
        //Get state id to search
        const { cityID } = req.params;
        //GetrqBody
        const { name, originalname, countryid,stateid, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('cities')
        .update(
            {
                name: name, 
                originalname : originalname,
                countryid : countryid,
                stateid:stateid,
                enabled : enabled,
                hide : hide
            })
        .eq('id',cityID)
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
/*
    Method: Delete city Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.delete("/City/:cityID", async(req, res, next) => {
    try{
        //Get state id to search
        const { cityID } = req.params;

        const resp = await adminCataloguesclient
        .from('cities')
        .delete()
        .eq('id', cityID);

        res.status(resp);
    } catch (err){
        next(err);
    }
});

/*
    Method: Read all cities Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Cities", async(req, res, next) => {
    try{
        const { data, error } = await adminCataloguesclient
        .from('cities')
        .select("name, originalname, countryid, stateid, enabled, hide");

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message" : "Reading process sucess", "info" : data
            });
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Read all cities by stateid Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Cities/ByState/:stateid", async(req, res, next) => {
    try{
        //Get state and country ids to search
        const { stateid } = req.params;
        const { data, error } = await adminCataloguesclient
        .from('cities')
        .select("id, name, originalname, countryid, stateid, enabled, hide")
        .eq('stateid',stateid);

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

/*
    Method: Read all cities by countryid Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Cities/:countryid", async(req, res, next) => {
    try{
        //Get state and country ids to search
        const { countryid } = req.params;
        const { data, error } = await adminCataloguesclient
        .from('cities')
        .select("name, originalname, countryid, stateid, enabled, hide")
        .eq('countryid',countryid);

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

/*
    Method: Create facilities Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.post("/Facility", async(req, res, next) => {
    try{
        //GetrqBody
        const { name,code, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .insert(
            {
                name: name, 
                code:code,
                enabled : enabled,
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

/*
    Method: Read facility Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Facility/:facilityID", async(req, res, next) => {
    try{
        //Get facilityID to search
        const { facilityID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .select("name, code, enabled, hide")
        .eq('id',facilityID);

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
/*
    Method: Update facility Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.put("/Facility/:facilityID", async(req, res, next) => {
    try{
        //Get state id to search
        const { facilityID } = req.params;
        //GetrqBody
        const { name,code, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .update(
            {
                name: name, 
                code:code,
                enabled : enabled,
                hide : hide
            })
        .eq('id',facilityID)
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

/*
    Method: Delete city Type: POST
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.delete("/Facility/:facilityID", async(req, res, next) => {
    try{
        //Get facility id to search
        const { facilityID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .delete()
        .eq('id', facilityID);

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(data.status);
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Read all facilities Type: GET
    In : Json - Out : Json
    Date: 15/05/2025
*/
app.get("/Facilities", async(req, res, next) => {
    try{
        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .select("id, name, code, enabled, hide");

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Reading process sucess", 
                "info":data
            });
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Create roles Type: POST
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.post("/Role", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('roles')
        .insert(
            {
                name: name,
                enabled : enabled,
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

/*
    Method: Read role Type: GET
    In : ID - Out : Json
    Date: 18/05/2025
*/
app.get("/Role/:roleID", async(req, res, next) => {
    try{
        //Get roleID to search
        const { roleID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('roles')
        .select("name, enabled, hide")
        .eq('id',roleID);

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

/*
    Method: Update role Type: POST
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.put("/Role/:roleID", async(req, res, next) => {
    try{
        //Get role id to search
        const { roleID } = req.params;
        //GetrqBody
        const { name, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('roles')
        .update(
            {
                name: name,
                enabled : enabled,
                hide : hide
            })
        .eq('id',roleID)
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

/*
    Method: Delete role Type: Delete
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.delete("/Role/:RoleID", async(req, res, next) => {
    try{
        //Get Role id to search
        const { RoleID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('roles')
        .delete()
        .eq('id', RoleID);

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(data.status);
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Read all roles Type: GET
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.get("/Roles", async(req, res, next) => {
    try{
        const { data, error } = await adminCataloguesclient
        .from('roles')
        .select("name, enabled, hide");

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

/*
    Method: Create usertype Type: POST
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.post("/UserType", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('usertypes')
        .insert(
            {
                name: name,
                enabled : enabled,
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

/*
    Method: Read usertype Type: GET
    In : ID - Out : Json
    Date: 18/05/2025
*/
app.get("/UserType/:UserTypeID", async(req, res, next) => {
    try{
        //Get UserTypeID to search
        const { UserTypeID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('usertypes')
        .select("name, enabled, hide")
        .eq('id',UserTypeID);

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

/*
    Method: Update user type Type: PUT
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.put("/UserType/:UserTypeID", async(req, res, next) => {
    try{
        //Get UserType id to search
        const { UserTypeID } = req.params;
        //GetrqBody
        const { name, enabled, hide } = req.body;

        const { data, error } = await adminCataloguesclient
        .from('usertypes')
        .update(
            {
                name: name,
                enabled : enabled,
                hide : hide
            })
        .eq('id',UserTypeID)
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

/*
    Method: Delete UserTypeID Type: Delete
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.delete("/UserType/:UserTypeID", async(req, res, next) => {
    try{
        //Get Role id to search
        const { UserTypeID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('usertypes')
        .delete()
        .eq('id', UserTypeID);

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(data.status);
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Read all user types Type: GET
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.get("/UserTypes", async(req, res, next) => {
    try{
        const { data, error } = await adminCataloguesclient
        .from('usertypes')
        .select("name, enabled, hide");

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

/*
    Method: Create user Type: POST
    In : Json - Out : Json
    Date: 18/05/2025
*/
app.post("/User", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, tag, lastName, secondName,password, email, countryID, stateID, cityID, enabled, hide } = req.body;

        const { data, error } = await anonclientuser
        .from('users')
        .insert(
            {
                name: name,
                tag : tag, 
                lastname : lastName, 
                secondname: secondName, 
                password : password, 
                countryid: countryID,
                stateid : stateID,
                cityid : cityID,
                description : description,
                email : email,         
                enabled : enabled,
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

/*
    Method: Read User Type: GET
    In : ID - Out : Json
    Date: 21/05/2025
*/
app.get("/User/:UserID", async(req, res, next) => {
    try{
        //Get UserID to search
        const { UserID } = req.params;

        const { data, error } = await userclient
        .from('users')
        .select('name, tag, lastname, password, email, countryid, stateid, cityid, enabled, hide')
        .eq('id',UserID);

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

/*
    Method: Update user Type: PUT
    In : Json - Out : Json
    Date: 21/05/2025
*/
app.put("/User/:UserID", async(req, res, next) => {
    try{
        //Get User id to search
        const { UserID } = req.params;
        //GetrqBody
        const { name, tag, lastName, password, email, countryID, stateID, cityID, enabled, hide } = req.body;

        const { data, error } = await userclient
        .from('users')
        .update(
            {
                name: name,
                tag : tag, 
                lastname : lastName, 
                secondname: secondName, 
                password : password, 
                countryid: countryID,
                stateid : stateID,
                cityid : cityID,
                description : description,
                email : email,  
                enabled : enabled,
                hide : hide
            })
        .eq('id',UserID)
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

/*
    Method: Delete User Type: Delete
    In : Json - Out : Json
    Date: 21/05/2025
*/
app.delete("/User/:UserID", async(req, res, next) => {
    try{
        //Get User id to search
        const { UserID } = req.params;

        const { data, error } = await userclient
        .from('users')
        .delete()
        .eq('id', UserID);

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(data.status);
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: change password Type: PATCH
    In : Json - Out : Json
    Date: 22/05/2025
*/
app.patch("/Users/Password/Change", async(req, res, next) => {
    try{
        //GetrqBody
        const { UserID, password } = req.body;
        
        const { data, error } = await userclient
        .from('users')
        .update({
            password : password
        })
        .eq('id', UserID);

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

/*
    Method: show user Type: PATCH
    In : Json - Out : Json
    Date: 22/05/2025
*/
app.patch("/Users/:UserID/Show", async(req, res, next) => {
    try{
        //GetrqBody
        const { UserID } = req.params;
        
        const { data, error } = await userclient
        .from('users')
        .update({
            hide : true
        })
        .eq('id', UserID);

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

/*
    Method: hide user Type: PATCH
    In : Json - Out : Json
    Date: 22/05/2025
*/
app.patch("/Users/:UserID/Hide", async(req, res, next) => {
    try{
        //GetrqBody
        const { UserID } = req.params;
        
        const { data, error } = await userclient
        .from('users')
        .update({
            hide : false
        })
        .eq('id', UserID);

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

