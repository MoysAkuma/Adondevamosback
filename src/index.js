import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import bodyParser from'body-parser';

import { createClient } from '@supabase/supabase-js';
//Swagger 
import swaggerUi  from 'swagger-ui-express';

// Load environment variables
dotenv.config(); 

const app = express();





// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SERVICE_KEY;


import swaggerJsDoc from 'swagger-jsdoc';

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

const placesclient = createClient(supabaseUrl,supabaseServiceKey , {
   db: { schema: 'places' }
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(bodyParser.json());
app.use(session({
  secret: process.env.leviosa, // Change this to a random string
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
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
 console.log("Adondevamos.back is running at ",process.env.PORT);
});

/*Autentication managment*/
/*
    Method: Log In  Type: POST
    In : Json - Out : Json
    Date: 05/07/2025
*/
app.post("/login", async(req, res, next) => {
    try{
        //GetrqBody
        const { id, password } 
            = req.body;
        
        //Validate if input is email
        const isEmailLogIng = isEmail(id);
        
        //if email search by email and password
        const data = (isEmailLogIng) ?
           await searchByEmailAndPassword(id, password, res) :
            //if text search by tag and password 
           await searchByTagAndPassword(id, password, res);
        
        //getifisadmin
        const datarole = await searchRole(data.id,  res);

        req.session.userId = data.id;
        
        res.status(200).json({
            role : datarole ? 'Admin' : 'User',
            id : data.id,
            tag : data.tag,
            name : data.name,
            lastname : data.lastname
        }).end();
    } catch (err){
        next(err);
    }
});
/*
    Method: CheckOut  Type: POST
    In : Json - Out : Json
    Date: 04/08/2025
*/
app.get("/check-auth", async(req, res, next) => {
    try{
        console.log(req.session);
        if(req.session.userId)
        {
            const data = await searchById(req.session.userId, res);

            if (data != null) {
                res.status(200).json(
                    {
                        "isAuthenticated": true,
                        "user" : data
                    }
                );
            }
        }else {
            res.status(409).json({
                "isAuthenticated": false
            });
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: logout  Type: POST
    In : Json - Out : Json
    Date: 04/08/2025
*/
app.get("/logout'", async(req, res, next) => {
    try{
        req.session.destroy( 
            err => {
                if(err){
                    return res.status(500).json({message:"Could not log out"})
                }
                res.clearCookie("connect.sid");
                res.status(200).json({            
                });
            }
        );
        
    }
    catch (err){
        next(err);
    }
});
// Email validation function
function isEmail(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
}

async function searchByEmailAndPassword (email, password, res){
    const { data, error } = 
        await userclient
        .from('users')
        .select("id,name, tag, lastname")
        .eq('email', email)
        .eq('password', password)
        .single();
    if (error) throw res.status(409).end();
    return data;
}

async function searchByTagAndPassword (tag, password, res){
    const { data, error } = 
        await userclient
        .from('users')
        .select("id, name, tag, lastname")
        .eq('tag', tag)
        .eq('password', password)
        .single()
    
    if (error) throw res.status(409).end();
    return data;
}

async function searchById (id, res){
    const { data, error } = 
        await userclient
        .from('users')
        .select()
        .eq('id', id)
        .single()
    
    if (error) throw res.status(409).end();
    return !!data;
}

async function searchRole (id, res){
    const { data, error } = 
        await userclient
        .from('admins')
        .select()
        .eq('userid', id)
        .single()
    
    if (error) throw res.status(409).end();
    return data;
}


/*
    Method: Create country Type: POST
    In : Json - Out : Json
    Date: 13/05/2025
*/
app.post("/Countries", async(req, res, next) => {
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
app.get("/Countries/:CountryID", async(req, res, next) => {
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
app.get("/Countries/:CountryID", async(req, res, next) => {
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
app.put("/Countries/:CountryID", async(req, res, next) => {
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
app.delete("/Countries/:CountryID", async(req, res, next) => {
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
app.patch("/Countries/:CountryID/Hide", async(req, res, next) =>{
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
app.patch("/Countries/:CountryID/Show", async(req, res, next) =>{
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
        .select()
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
app.post("/Facilities", async(req, res, next) => {
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
app.get("/Facilities/:facilityID", async(req, res, next) => {
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
app.put("/Facilities/:facilityID", async(req, res, next) => {
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
app.delete("/Facilities/:facilityID", async(req, res, next) => {
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
    Method: Hide facility
    In : Json - Out : Json
    Date: 13/06/2025
*/
app.patch("/Facilities/:facilityID/Hide", async(req, res, next) => {
    try{
        //Get state id to search
        const { facilityID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .update( { hide : true })
        .eq('id',facilityID)
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Edition process sucess", "info":data
            });
        } else {
            res.status(400).json({
                "Message": "Not success"
            });
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Show facility
    In : Json - Out : Json
    Date: 13/06/2025
*/
app.patch("/Facilities/:facilityID/Show", async(req, res, next) => {
    try{
        //Get state id to search
        const { facilityID } = req.params;

        const { data, error } = await adminCataloguesclient
        .from('facilities')
        .update( { hide : false })
        .eq('id',facilityID)
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Edition process sucess", "info":data
            });
        } else {
            res.status(400).json({
                "Message": "Not success"
            });
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
app.post("/Users", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, tag, description, lastName, secondName,password, email, countryID, stateID, cityID, enabled, hide } = req.body;

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
app.get("/Users/:UserID", async(req, res, next) => {
    try{
        //Get UserID to search
        const { UserID } = req.params;

        const { data, error } = await userclient
        .from('users')
        .select()
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
app.put("/Users/:UserID", async(req, res, next) => {
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
app.delete("/Users/:UserID", async(req, res, next) => {
    try{
        //Get User id to search
        const { UserID } = req.params;

        const { data, error } = await userclient
        .from('users')
        .delete()
        .eq('id', UserID);

        if (error) throw res.status(500).json(error);
        res.status(data.status);
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

/*
    Method: Search users with Email or  Type: GET
    In : ID - Out : Json
    Date: 23/07/2025
*/
app.get("/Users/Search/tag=:searchText", async(req, res, next) => {
    try{
        //Get tag or email to search
        const { searchText } = req.params;
        const { data, error } = await userclient
        .from('users')
        .select('id, name, email, tag, email')
        .or(`tag.ilike.%${searchText}%, email.ilike.%${searchText}%`)
        .limit(5);

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
    Method: Verify if tag is available Type: GET
    In : String - Out : Json
    Date: 15/06/2025
*/
app.get("/Users/Verify/Tag/:newtag", async(req, res, next) => {
    try{
        //Get tag to search
        const { newtag } = req.params;
        const tagExists = await checkTagExists(newtag);
    
        if (tagExists) {
           return res.status(409).json({ message:"Tag is taken"});
        }
        return res.status(200).json({ message:"Tag is available"});
        
    } catch (err){
        next(err);
    }
});

async function checkTagExists(tag){
    const { data, error } = await anonclientuser
        .from('users')
        .select('tag')
        .eq("tag", tag)
        .single();
    return !!data;
}

/*
    Method: Verify if email is available Type: GET
    In : String - Out : Json
    Date: 15/06/2025
*/
app.get("/Users/Verify/Email/:email", async(req, res, next) => {
    try{
        //Get tag to search
        const { email } = req.params;
        const emailExists = await checkEmailExists(newtag);
    
        if (emailExists) {
           return res.status(409).json({ message:"Email is taken"});
        }
        return res.status(200).json({ message:"Email is available"});
        
    } catch (err){
        next(err);
    }
});

async function checkEmailExists(email){
    const { data, error } = await anonclientuser
        .from('users')
        .select('email')
        .eq("email", email)
        .single();
    return !!data;
}

/*
    Method: Create place Type: POST
    In : Json - Out : Json
    Date: 27/06/2025
*/
app.post("/Places", async(req, res, next) => {
    try{
        //GetrqBody
        const { name, description, countryid, 
            stateid, cityid, address, isinternational } 
            = req.body;

        const { data, error } = 
        await placesclient
        .from('places')
        .insert({
            name : name,
            description : description, 
            countryid : countryid, 
            stateid : stateid,
            cityid : cityid, 
            address : address, 
            isinternational : isinternational
        })
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(201).json(
            {
                "Message" : "Creation process sucess", 
                "info" : data
            });
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Read all Places Type: GET
    In : ID - Out : Json
    Date: 12/07/2025
*/
app.get("/Places", async(req, res, next) => {
    try{
        const { data, error } = await placesclient
        .from('places')
        .select();

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
    Method: Read all Places Type: GET
    In : ID - Out : Json
    Date: 12/07/2025
*/
app.get("/Places/Search/name=:PlaceName", async(req, res, next) => {
    try{
        //Get Place Name to search
        const { PlaceName } = req.params;
        const { data, error } = await placesclient
        .from('places')
        .select('id, name, description')
        .ilike('name', `%${PlaceName}%`)
        .limit(5);

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
    Method: Read Place Type: GET
    In : ID - Out : Json
    Date: 27/06/2025
*/
app.get("/Places/:PlaceID", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { PlaceID } = req.params;

        const { data, error } = await placesclient
        .from('places')
        .select()
        .eq('id',PlaceID);

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
app.put("/Places/:PlaceID", async(req, res, next) => {
    try{
        //Get place id to search
        const { PlaceID } = req.params;
        //GetrqBody
        const { countryid, stateid, cityid, 
            description, address, isinternational
            , name } = req.body;

        const { data, error } = await placesclient
        .from('users')
        .update(
            {
                countryid : countryid, 
                stateid : stateid,
                cityid : cityid, 
                description : description, 
                address : address, 
                isinternational : isinternational
            })
        .eq('id',PlaceID)
        .select();

        if (error) throw res.status(500).json(error);
        if (data != null) {
            res.status(200).json({
                "Message": "Edition process sucess",
                "info":data
            });
        }
    } catch (err){
        next(err);
    }
});

/*
    Method: Delete User Type: Delete
    In : Json - Out : Json
    Date: 27/05/2025
*/
app.delete("/Places/:PlaceID", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { PlaceID } = req.params;

        const { data, error } = 
        await placesclient
        .from('places')
        .delete()
        .eq('id', PlaceID);

        if (error) throw res.status(500).json(error);
        res.status(data.status);
    } catch (err){
        next(err);
    }
});

/*
    Method: Check place exists
    In : Json - Out : Json
    Date: 04/07/2025
*/
async function checkPlaceExists(Placeid){
    const { data, error } = await placesclient
        .from('places')
        .select('id')
        .eq("id", Placeid)
        .single();
    return !!data;
}

/*
    Method: Create place facility list Type: POST
    In : Json - Out : Json
    Date: 29/06/2025
*/
app.post("/Places/:PlaceID/Facilities", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { PlaceID } = req.params;

        //GetrqBody
        const { selectedFacilities } = req.body;
        
        // Validate PlaceID
        if (!PlaceID || isNaN(PlaceID)) {
            return res.status(400).json({ error: 'Invalid PlaceID' });
        }

        //Validate SelectedPlaces
        if (!Array.isArray(selectedFacilities)) {
            return res.status(400).json({ error: 'SelectedFacilities must be an array' });
        }
        
        //Validate place exist
        const placeexist = await checkPlaceExists(PlaceID);

        if(!placeexist){
            throw res.status(409).json({error: 'Place id not found'})    
        }
        
        // Add PlaceID to each item
        const itemsToInsert = selectedFacilities.map(item => ({
            ...item,
            placeid: parseInt(PlaceID)
        }));

        //Insert all selected facilities
        const { error } = await placesclient
        .from('places_facilities')
        .insert(itemsToInsert);
        
        if (error) throw res.status(500).json(error);

        res.status(201).json({
            "Message": "Creation process sucess"
        });
        
    } catch (err){
        next(err);
    }
});

/*
    Method: Read  Type: GET
    In : Json - Out : Json
    Date: 04/07/2025
*/
app.get("/Places/:PlaceID/Facilities", async(req, res, next) => {
    try {
        //Get PlaceID to search
        const { PlaceID } = req.params;

        // Validate PlaceID
        if (!PlaceID || isNaN(PlaceID)) {
            return res.status(400).json({ error: 'Invalid PlaceID' });
        }

        //Validate place exist
        const placeexist = await checkPlaceExists(PlaceID);

        if(!placeexist){
            throw res.status(409).json({error: 'Place id not found'})    
        }

        const { data, error } = await placesclient
        .from('places_facilities')
        .select()
        .eq('placeid',PlaceID);

        if (error) throw res.status(500).json(error);
        
        if (data.length === 0) throw res.status(404).end();

        res.status(200).json({
            "Message": "Reading process sucess", 
            "info" : data
        });
        
    } catch (err){
        next(err);
    }
});

/*
    Method: Get info to screen ViewPlace Type: GET
    In : Json - Out : Json
    Date: 12/07/2025
*/
app.get("/View/Places/:PlaceID/Facilities", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { PlaceID } = req.params;

        // Validate PlaceID
        if (!PlaceID || isNaN(PlaceID)) {
            return res.status(400).json({ error: 'Invalid PlaceID' });
        }

        //Validate place exist
        const placeexist = await checkPlaceExists(PlaceID);

        if(!placeexist){
            throw res.status(409).json({error: 'Place id not found'})    
        }
        
        //Get facilitie list
        const { data : respSelectedData, error: errorSelectedData } = await placesclient
        .from('places_facilities')
        .select("id, facilityid, value")
        .eq('placeid', PlaceID);

        //if error getting facilitylist
        if (errorSelectedData) throw res.status(500).json(errorFacilityList).end();

        //No Selected facilities found
        if(!respSelectedData) throw res.status(404).json({error: "No facilities was selected"});
        
        //Get facility name list
        const { data : respfacilityNameList, error: errorNames } = await adminCataloguesclient
        .from('facilities')
        .select("id, name")
        .in("id", respSelectedData.map( item => item.facilityid ) );

        //if error getting facilitylist
        if (errorNames) throw res.status(500).json(errorFacilityList);

        //final response
        const resdata = respSelectedData.map( selectedFacilities => 
            {
                const searchName = respfacilityNameList.find(x => x.id === selectedFacilities.facilityid );
                return {
                    name: searchName?.name || null,
                    id : selectedFacilities.facilityid,
                    value : selectedFacilities.value
                };
            }
        );
        
        res.status(200).json({
            "Message": "Reading process sucess", "info":resdata
        });
        
    } catch (err){
        next(err);
    }
});

/*
    Method: Edit value of selected facility Type: PATCH
    In : Json - Out : Json
    Date: 04/07/2025
*/
app.patch("/Places/:PlaceID/Facilities/:FacilityID", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { PlaceID,  FacilityID} = req.params;

        //GetrqBody
        const { value } = req.body;
        
        //Validate place exist
        const placeexist = await checkPlaceExists(PlaceID);

        if(!placeexist){
            throw res.status(409).json(error)    
        }
        
        const { error } = await placesclient
        .from('places_facilities')
        .update({value : value })
        .eq("id");

        if (error) throw res.status(500).json(error);
        
        res.status(201).json({
            "Message": "Creation process sucess"
        });
    } catch (err){
        next(err);
    }
});

/*
    Method: Delete all created facilities of a place  Type: Delete
    In : Json - Out : Json
    Date: 04/07/2025
*/
app.delete("/Places/:PlaceID/Facilities", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { PlaceID } = req.params;

        const { data, error } = 
        await placesclient
        .from('places')
        .delete()
        .eq('id', PlaceID);

        if (error) throw res.status(500).json(error);
        res.status(data.status);
    } catch (err){
        next(err);
    }
});



/*
    Method: Get Country, State or city name Place Type: GET
    In : ID - Out : Json
    Date: 09/07/2025
*/
app.get("/Places/Ubications/:CountryID/:StateID/:CityID", async(req, res, next) => {
    try{
        //Get PlaceID to search
        const { CountryID, StateID, CityID } = req.params;

        // Fetch data from country, state and citis
        const [countryResponse, stateResponse, citiesResponse] = await Promise.all([
        adminCataloguesclient
            .from('countries')
            .select("name")
            .eq('id',CountryID)
            .single(),
        adminCataloguesclient
            .from('states')
            .select("name")
            .eq('id',StateID)
            .single(),
        adminCataloguesclient
            .from('cities')
            .select("name")
            .eq('id',CityID)
            .single()
        ]);

         // Check for errors in any of the responses
        const errors = [
        countryResponse.error,
        stateResponse.error,
        citiesResponse.error
        ].filter(Boolean);

        if (errors.length > 0) {
        return res.status(500).json({ 
            error: 'Failed to fetch data from one or more tables',
            details: errors
        });
        }

        
        res.status(200).json({
            "Message": "Reading process sucess", "info" : {
                CountryName : countryResponse.data.name,
                StateName : stateResponse.data.name,
                CityName : citiesResponse.data.name
            }
        });

    } catch (err){
        next(err);
    }
});