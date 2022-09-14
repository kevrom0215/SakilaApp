let express = require('express');
let router = express.Router();
let connection = require('../connection');
const {authenticateToken} = require('../interceptors/tokenAuthenticator')


router.get('/search/all', authenticateToken ,function(req,res,next){
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

router.get('/search/firstname/:query', authenticateToken,(req,res,next)=>{
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



router.get('/search/lastname/:query', authenticateToken,(req,res,next)=>{
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

getActorbyID = async (actorid)=>{
    let getAllSql = `SELECT * from actor where actor_id = ${actorid}`
    let actor= await new Promise((resolve, reject) =>{
        connection.query(getAllSql, (err,result)=>{
            if(err) reject(err);
            else{
                resolve(result);
            }
        })
    })
    return actor[0];
}

router.post('/', authenticateToken, async (req, res, next) => {
    if(req.user.userType === "staff"){
        const bodyKeys = Object.keys(req.body);
        const bodyVals = Object.values(req.body).map((val) =>
            typeof val === "string" ? `"${val}"` :
            !val ? "null" : val
        );
        const sql = `INSERT INTO actor (${bodyKeys}) VALUES (${bodyVals})`;
        res.status(200).send("sent");
    }
    else{
        res.status(400).send(`
        <html>
            <body align=center>        
                <img width=auto height=100% src='https://http.dog/404.jpg'/>
                <h1>$req.user.userType</h1>
            </body>
        </html>
        `);
    }
});

router.delete('/', authenticateToken, async(req, res,next)=>{
    let sql = `DELETE FROM actor WHERE actor_id = "${req.params.query}"`;
    if(req.user.userType === "staff"){
        const film = await getActorbyID(req.params.query)
        if(!film){
            res.status(200).send("no match")
        }
        else{
            connection.query(sql, (err, result)=>{
                if(err) throw err;
                res.status(200).json({
                    "status": 200,
                    "result": result
                })
            })
        }
        
    }
    else{
        res.status(400).send(`
        <html>
            <body align=center>        
                <img width=auto height=100% src='https://http.dog/404.jpg'/>
            </body>
        </html>
        `);
    }
})

router.put('/', authenticateToken, async(req,res,next)=>{
    if(req.user.userType === "staff"){
        let reqBody= "";
        Object.keys(req.body).forEach((xandy, index) => {
            if(Object.keys(req.body).length!=index+1){
                reqBody += `${xandy} = "${req.body[xandy]}", `
            }
            else{
                reqBody += `${xandy} = "${req.body[xandy]}"`
            }
        });
        const actor = await getActorbyID(req.body.film_id)
        let sql = `UPDATE actor set ${reqBody} where actor_id = "${req.body.actor_id}"`;
        if(!actor){
            res.status(200).send("no match");
        }
        else{
            connection.query(sql, (err, result)=>{
                res.status(200).json({
                    "message": "Updated",
                    "value": result
                });
            })
            
        }

    }
    else{
        res.status(400).send(`
        <html>
            <body align=center>        
                <img width=auto height=100% src='https://http.dog/404.jpg'/>
            </body>
        </html>
        `);
    }
})

module.exports = router;