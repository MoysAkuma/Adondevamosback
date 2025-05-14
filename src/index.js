const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config(); 

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
   db: { schema: 'trips, catalogues' }
});

//Configuraciones
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2)

// Middleware to parse JSON bodies
app.use(express.json());

app.listen(3000, () => {
 console.log("Adondevamos.back is running at 3000");
});

/*
    Method: Welcome
    Type: GET
    In : Json - Out : Json
    Date: 01:01:2025
*/
app.get('/',(req,res)=>{
    res.json(
        {"msg":"Welcome"}
    );
});

/*
    Method: Get all info of a trip
    Type: POST
    In : int - Out : Json
    Date: 16:02:2025
*/

app.get("/GetTrip/:id", async (req, res, next) => {
    const {id} = req.params;
    const message = req.body.message;
    const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq("id",id)
    .maybeSingle();
  
    if (error) return res.status(400).json({ error: error.message });
    if(data != null){
        res.status(200).json(
        {
            "Message":"Process of Reading success!",
            "Info":data
        });
    } else {
        res.status(404).json(
        {
            "Message":"Process of Reading failed!"
        });
    }
    
});

/*
    Method: GetCountries
    Type: GET
    In : NONE - Out : Json
    Date: 13/05/2025
*/

app.get("/GetCountries/", async (req, res, next) => {
    const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq("id",id)
    .maybeSingle();
  
    if (error) return res.status(400).json({ error: error.message });
    if(data != null){
        res.status(200).json(
        {
            "Message":"Process of Reading success!",
            "Info":data
        });
    } else {
        res.status(404).json(
        {
            "Message":"Process of Reading failed!"
        });
    }
    
});

/*
    Method: Create country
    Type: POST
    In : Json - Out : Json
    Date: 13/05/2025
*/
app.post("/Country/Create", async(req, res, next) => {
    //GetrqBody
    const { name, originalname, acronym } = req.body;
    const message = req.body.message;
    const { data, error } = await supabase
    .from('countries')
    .insert(
        { name: name, 
        originalname : originalname,
        acronym: acronym
        })
    .select();

    if(data != null){
        res.status(200).json(
        {
            "Message":"Process of creation success!",
            "Info":data
        });
    } else {
        res.status(500).json(
        {
            "Message":"Process of creation failed!"
        });
    }
});

/*
    Method: Get all trips created by user
    Type: Get
    In : int - Out : Json
    Date: 16:02:2025
*/
app.get("/GetTripsByOwner/:UserID",async (req, res, next) => {
    /*const {UserID} = req.params;
    const message = req.body.message;
    pool.query('SELECT Name, Description, InitialDate, FinalDate,UbicationID, isInternational FROM trips Where OwnerID = ?',
        [id], 
        (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Process of Reading failed!' });
        }
        res.status(200).json(
            {
                "Message":"Process of get all trips for a user success!",
                "Info": results
            }
        );
    });*/
});

/*
    Method: Get all trips
    Type: Get
    In : int - Out : Json
    Date: 16:02:2025
*/

app.get("/all", async (req, res, next) => {
    const message = req.body.message;
    /*pool.query('SELECT TripID, Name, Description, InitialDate, FinalDate,UbicationID, isInternational FROM trips',
        (err, results) => {
        if (err) {
            console.error('Error get all:', err);
            return res.status(500).json({ error: 'Process of Reading failed!' });
        }
        res.status(200).json(
            {
                "Message":"Process of Reading success!",
                "Info": results
            }
        );
    });*/
});

/*
    SubMethod Grop: POST
    Date: 17:03:2025
*/
/*
    Method: Create trip
    Type: POST
    In : Json - Out : Json
    Date: 16:02:2025
*/
app.post("/CreateTrip", async (req, res, next) => {
    //GetrqBody
    const { Name, Desc, IniDat, FinDat,ubiID, isint, OwnerID } = req.body;
    const message = req.body.message;
    /*
    const[resp] = pool.query(
        'INSERT INTO trips (Name, Description, InitialDate, FinalDate,UbicationID, isInternational, OwnerID) VALUES (?, ?, ?, ?, ?, ?)',
        [Name, Desc, IniDat, FinDat,ubiID, isint, OwnerID],
        (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Failed to insert data' });
            }
            res.status(201).json({            
                "Message":"Process of Creation success"
                ,"Result":"New Trip Created"
                ,"UniqueKey":results.insertId
                ,"CompleteUrl":"TBD"
            });
        }
    );
    */
});
/*
    SubMethod Grop: PUT
    Date: 27:03:2025
*/
/*
    Method: Update trip
    Type: Put
    In : Json Out : Json
*/

app.put("/UpdateTrip", async (req, res, next) => {
    /*
    //GetrqBody
    const { TripID, Name, Desc, IniDat, FinDat,ubiID, isint } = req.body;
    const message = req.body.message;
    
    pool.query(
        'UPDATE trips SET Name = ?, Description = ? , InitialDate = ?, FinalDate= ?,UbicationID= ?, isInternational = ? WHERE TripID = ?',
        [Name, Desc, IniDat, FinDat,ubiID, isint, TripID],
        (err, results) => {
            if (err) {
                console.error('Process of Creation failed:', err);
                return res.status(500).json({ error: 'Process of Creation failed' });
            }
            res.status(200).json({            
                "Message":"Process of Edition Success"
                ,"Result":"Data edited"
            });
        }
    );*/
});
/*
    SubMethod Grop: DELETE
    Date: 27:03:2025
*/
/*
    Method: Delete trip
    Type: delete
    In : Json  Out : Json
*/

app.delete("/DeleteTrip/:TripID", (req, res, next) => {
/*    
    const { TripID } = req.params;

    pool.query('DELETE FROM trips WHERE TripID = ?', [TripID], (err, results) => {
        if (err) {
            console.error('Error deleting data:', err);
            return res.status(500).json({ error: 'Failed to delete data' });
        }
        res.status(200).json({ message: 'Trip deleted successfully' });
    });*/
});

/*
    Method Gruop: Places
    Date: 17:03:2025
*/

/*
    SubMethod Grop: GET
    Date: 27:03:2025
*/

/*
    Method: Get all info of a places
    Type: POST
    In : int - Out : Json
    Date: 16:02:2025
*/

app.get("/GetPlace/:PlaceID", (req, res, next) => {
   /* try{
        const {PlaceID} = req.params;
        
        const [placeinfo] = pool.promise().query('SELECT Name, Description, CountryID,CityID, StateID, Address FROM places Where PlaceID = ?',
            [id], 
            (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Process of Reading failed!' });
            }
            
        });

        const [resultfacilities] = pool.promise().query('SELECT logo, name, value FROM facilities Where PlaceID = ?',
            [id], 
            (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ error: 'Process of Reading failed!' });
            }
            
        });

        const resp = placeinfo.map( place => ({
            ...place,
            "facilities": resultfacilities
        }));
        
        res.status(200).json(
            {
                "Message":"Process of Reading success!",
                "Info": resp
            }
        );
    } catch (err){
        res.status(500).send('Server Error');
    }*/
});

/*
    SubMethod Grop: POST
    Date: 27:03:2025
*/

/*
    Method: Create place
    Type: POST
    In : Json - Out : Json
    Date: 16:02:2025
*/
app.post("/CreatePlace", (req, res, next) => {
    //GetrqBody
    const { Name, Description, CountryID,CityID, StateID, Address, Facilities } = req.body;
    const message = req.body.message;
    
    /*const [place] =pool.query(
        'INSERT INTO places (Name, Description, CountryID,CityID, StateID, Address) VALUES (?, ?, ?, ?, ?, ?)',
        [Name, Description, CountryID,CityID, StateID, Address],
        (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).json({ error: 'Failed to insert place' });
            }
        }
    );

    if(Array.isArray(Facilities)){
        const placeHolder = Facilities.map(Facility => '(?,?,?)').join(',') ;
        const values = Facilities.flatMap(Facility => [Facility.logo, Facility.name,Facility.value]);
        pool.query(
            'INSERT INTO facilities (logo, name, value) VALUES ${placeHolder}',
            values,
            (err, results) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).json({ error: 'Failed to insert facilities' });
                }
            }
        );    
    }*/
});

/*
    Method: ConfirmationEmail
    Type: POST
    In : Json - Out : Json
    Date: 23:03:2025
*/
app.get("/ConfirmationEmail/:token", (req, res, next) => {
    const {token} = req.params;
    
    /*pool.query('UPDATE EmailConfirmation SET value = true Where token = :token',
        [token], 
        (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Process of Reading failed!' });
        }
        res.status(200);
    });*/
});

/*
    Method Gruop: User
    Date: DD:MM:AAAA
*/

/*
    Method: METHOD_NAME
    Type: POST
    In : IN - Out : OUT
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: GET
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: POST
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: PUT
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: DELETE
    Date: DD:MM:AAAA
*/

/*
    Method Gruop: METHOD_GROUP_NAME
    Date: DD:MM:AAAA
*/

/*
    Method: METHOD_NAME
    Type: POST
    In : IN - Out : OUT
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: GET
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: POST
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: PUT
    Date: DD:MM:AAAA
*/

/*
    SubMethod Grop: DELETE
    Date: DD:MM:AAAA
*/

class Message {
    constructor(content) {
      this.content = content;
    }
   
    getContent() {
      return this.content;
    }
}

