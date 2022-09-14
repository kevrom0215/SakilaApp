const express = require("express");
const app = express();
const login = require("../interceptors/loginAuthenticator")
let router = express.Router();
const jwt = require('jsonwebtoken');


router.post('/', async (req,res,next)=>{
    let base64Encoding = req.headers.authorization.split(" ")[1];
    let credentials = Buffer.from(base64Encoding, "base64").toString().split(":");
    const username = credentials[0];
    const password = credentials[1];
    var appData = {};

    
    if(!req || !req.headers?.authorization){
        res.status(401).send(`<html>
        <body align=center>        
                    <img src='https://http.cat/401.jpg'/>
                    </body>
                </html>`
                )
    }
    else{
        const isAuthenticated = await login.authenticateUser(username, password);
        if(isAuthenticated){
            const userType = await login.getUserType(username);
            const accessToken = jwt.sign({username, password, userType}, process.env.ACCESS_TOKEN_SECRET);
            res.status(200).send({
                "message": "user authenticated",
                "token": accessToken,
                "userType": userType,
            });
           
        }
        else{
            res.status(401).send({
                "message": "user not authenticated",
            })
        }
    };
        
});



// router.post('/login', async (req,res,next)=>{
//     if(!req || !req.headers?.authorization){
//         res.status(401).send(`<html>
//         <body align=center>        
//                     <img src='https://http.cat/401.jpg'/>
//                     </body>
//                 </html>`
//                 )
       
//     } 
//     let base64Encoding = req.headers?.authorization?.split(" ")[1] || " ";
//     let credentials = Buffer.from(base64Encoding, "base64").toString().split(":");
//     const email = credentials[0];
//     const ee = await login.getUserbyEmail(email);
//     if(ee){
//         const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
//         res.status(200).send({
//             message: "User is logged in",
//             signedToken: accessToken,
//             user: email
//         })
//     }
//     else{
//         res.status(401).send({
//             message: "User not found. Unauthorized"
//         })

//     }

    
    
// });



module.exports = router;