const { json } = require('express');
let express = require('express');
let router = express.Router();
let connection = require('../connection');
const {authenticateToken} = require('../interceptors/tokenAuthenticator')



router.get('/search/actor/:query', authenticateToken,(req,res,next)=>{
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

router.get('/search/genre/:query', authenticateToken,(req,res,next)=>{
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



router.get('/available', authenticateToken,(req,res,next)=>{
    let sql = `SELECT * FROM film where film_id IN (SELECT DISTINCT inv.film_id FROM inventory AS inv LEFT JOIN (SELECT inventory_id, film_id FROM rental LEFT JOIN inventory USING (inventory_id) WHERE return_date is null) AS unreturned ON inv.inventory_id = unreturned.inventory_id WHERE unreturned.inventory_id IS NULL) and film_id!=0`;
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

router.get('/all', authenticateToken, (req,res,next)=>{
    if(req.user.userType === "staff"){
        let sql = `SELECT * from film`
        connection.query(sql, (err, result)=>{
        if(err) throw err;
        res.status(200).json({
            "status": 200,
            "data": result
        })
        })
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

router.post('/', authenticateToken, (req, res,next) => {
    if(req.user.userType === "staff"){
        const bodyKeys = Object.keys(req.body);
        const bodyVals = Object.values(req.body).map((val) =>
            typeof val === "string" ? `"${val}"` :
            !val ? "null" : val
        );
        const sql = `INSERT INTO film (${bodyKeys}) VALUES (${bodyVals})`;
        //let sql = `INSERT into film (${columns}) values (${values})`
        console.log(sql);
        connection.query(sql, (err,result)=>{
            if(err) throw err;
            res.status(200).json({
                "message": "updated",
                "value": result
            })
        })
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
});


getFilmbyId = async (filmid) =>{
    let getAllSql = `SELECT * from film where film_id = ${filmid}`
    let film = await new Promise((resolve, reject) =>{
        connection.query(getAllSql, (err,result)=>{
            if(err) reject(err);
            else{
                resolve(result);
            }
        })
    })
    return film[0];
}



router.put('/', authenticateToken, async (req,res,next)=>{
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
        const film = await getFilmbyId(req.body.film_id)
        let sql = `UPDATE film set ${reqBody} where film_id = "${req.body.film_id}"`;
        if(!film){
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
});
//delete
router.put('/delete/:query', authenticateToken, async (req,res,next) =>{
    let sql = `UPDATE film set film_id=0 WHERE film_id = "${req.params.query}"`;
    if(req.user.userType === "staff"){
        const film = await getFilmbyId(req.params.query)
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
});

module.exports=router;