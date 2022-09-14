let express = require('express');
let app = express();
let router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser')
const login = require("./routes/login")
const {authenticateToken} = require('./interceptors/tokenAuthenticator')
const film = require("./routes/film")
const actor = require("./routes/actor")
const customer = require("./routes/customer")
const jwt = require('jsonwebtoken');

app.use(express.json());
app.use(bodyParser.raw({inflate:true, limit: '100kb', type: 'application/json'}));
app.use("/login",login)
app.use("/film",film)
app.use("/actor",actor)
app.use("/customer",customer)


router.get('/', authenticateToken, function(req,res,next){
    res.status(200).send(`<html>
        <body align=center>        
                    <img src='https://http.cat/200.jpg'/>
                    </body>
                </html>`
                )
});

router.get('*', function(req, res){
    res.status(404).send(`
    <html>
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

