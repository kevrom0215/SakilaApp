let express = require('express');
let app = express();
const login = require('./login');
let connection = require('./connection');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let router = express.Router();


router.get('/', authenticateToken,function(req,res,next){
    res.status(200).send(`<html>
        <body align=center>        
                    <img src='https://http.cat/200.jpg'/>
                    </body>
                </html>`
                )
});

router.get('/actorList', authenticateToken ,function(req,res,next){
    connection.query("SELECT * FROM actor", (err, result, fields) =>{
        if(err) {
            throw err;
        }
        else {
            res.status(200).json({
                "status": 200,
                "statusText": "OK",
                "message": "All actors retrieved.",
                "data": result
            });
        }
    });   
    
});

router.post('/login', async (req,res,next)=>{
    if(!req || !req.headers?.authorization){
        res.status(401).send(`<html>
        <body align=center>        
                    <img src='https://http.cat/401.jpg'/>
                    </body>
                </html>`
                )
       
    } 
    let base64Encoding = req.headers?.authorization?.split(" ")[1] || " ";
    let credentials = Buffer.from(base64Encoding, "base64").toString().split(":");
    const email = credentials[0];
    const ee = await login.getUserbyEmail(email);
    if(ee){
        const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
        res.status(200).send({
            message: "User is logged in",
            signedToken: accessToken,
            user: email
        })
    }
    else{
        res.status(401).send({
            message: "User not found. Unauthorized"
        })

    }

    
    
});

function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)
    
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
        console.log(err)
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}



router.get('/search/actor/firstname/:query', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM actor where first_name like "%${req.params.query}%"`;
    connection.query(sql, (err, result) =>{
        if (err) throw err;
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "All actors retrieved.",
            "data": result
        });
    })
});

router.get('/search/actor/lastname/:query', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM actor where last_name like "%${req.params.query}%"`;
    connection.query(sql, (err, result) =>{
        if (err) throw err;
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "All actors retrieved.",
            "data": result
        });
    })
});

router.get('/search/film/title/:query', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM film where title like "%${req.params.query}%"`;
    connection.query(sql, (err, result) =>{
        if (err) throw err;
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "All films retrieved.",
            "data": result
        });
    })
});

router.get('/search/film/genre/:query', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM film LEFT JOIN  (SELECT film_id, c.name as category FROM film_category fc LEFT JOIN category c using (category_id)) as a USING (film_id) where category like "%${req.params.query}%"`;
    connection.query(sql, (err, result) =>{
        if (err) throw err;
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "All films retrieved.",
            "data": result
        });
    })
});

router.get('/search/film/actor/:query', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM film LEFT join (SELECT film_id, first_name, last_name FROM film_actor fa LEFT JOIN actor a using (actor_id)) as b USING (film_id) where last_name LIKE "%${req.params.query}%"`;
    connection.query(sql, (err, result) =>{
        if (err) throw err;
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "All films retrieved.",
            "data": result
        });
    })
});

router.get('/available', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM film where film_id IN (SELECT DISTINCT inv.film_id FROM inventory AS inv LEFT JOIN (SELECT inventory_id, film_id FROM rental LEFT JOIN inventory USING (inventory_id) WHERE return_date is null) AS unreturned ON inv.inventory_id = unreturned.inventory_id WHERE unreturned.inventory_id IS NULL)`;
    connection.query(sql, (err, result) =>{
        if (err) throw err;
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "All films available retrieved.",
            "data": result
        });
    })
});

app.get('*', function(req, res){
    res.send(`<html>
    <body align=center>        
                <img width=auto height=100% src='https://http.dog/404.jpg'/>
                </body>
            </html>`);
  });


app.use('/', router);
app.use(express.json());

var port = 5001;
var server = app.listen(port, function(){
    console.log('Node server is running on http://localhost:' + port + "..");
});

