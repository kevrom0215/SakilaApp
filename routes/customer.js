let express = require('express');
let router = express.Router();
let connection = require('../connection');
const {authenticateToken} = require('../interceptors/tokenAuthenticator')


router.get('/search/firstname/:query', authenticateToken,(req,res,next)=>{
    if(req.user.userType === "staff"){
        let sql = `SELECT * FROM customer where first_name like "%${req.params.query}"`;
        connection.query(sql, (err, result) =>{
            if (err) throw err;
            res.status(200).json({
                "status": 200,
                "statusText": "OK",
                "message": "All customers matching retrieved.",
                "data": result
            });
        })
    }
    else{
        res.status(200).send("Unauthorized")
    }
});

router.get('/search/lastname/:query', authenticateToken,(req,res,next)=>{
    if(req.user.userType === "staff"){
        let sql = `SELECT * FROM customer where last_name like "${req.params.query}"`;
        connection.query(sql, (err, result) =>{
           if (err) throw err;
            res.status(200).json({
                "status": 200,
                "statusText": "OK",
                "message": "All matching customers retrieved.",
                "data": result
            });
        })
    }
    else{
        res.status(200).send("Unauthorized")
    }
});
router.get('/search/country/:query', authenticateToken,(req,res,next)=>{
    if(req.user.userType === "staff"){
        let sql = `select c3.country, c2.city , concat(c.first_name, " ",c.last_name) as fullname from customer c 
        left join address a on c.address_id = a.address_id
        left join city c2 on a.city_id = c2.city_id 
        left join country c3 on c2.country_id = c3.country_id 
        where c3.country like "%${req.params.query}%"` ;
        connection.query(sql, (err, result) =>{
            if (err) throw err;
            res.status(200).json({
                "status": 200,
                "statusText": "OK",
                "message": "All countries retrieved.",
                "data": result
            });
        })
    }
    else{
        res.status(200).send("Unauthorized")
    }
});

router.get('/', authenticateToken,(req,res,next)=>{
    if(req.user.userType === "staff"){
        let sql = `SELECT * FROM customer`;
        connection.query(sql, (err, result) =>{
            if (err) throw err;
            res.status(200).json({
                "status": 200,
                "statusText": "OK",
                "message": "All customers retrieved.",
                "data": result
            });
        })
    }
    else{
        res.status(200).send("Unauthorized")
    }
});

module.exports = router;