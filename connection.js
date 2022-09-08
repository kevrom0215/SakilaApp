let mysql = require('mysql');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'sakila'
});

connection.connect((err) =>{
    if(err){
        throw err;
    }
    console.log("Connected to DB...")
});

module.exports = connection;