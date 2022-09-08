const { query } = require("express");
const { connect } = require("./connection");
let connection = require("./connection");
let isLoggedIn;

getUserbyEmail = async (username) =>{
    const users = await new Promise((resolve, reject) => {
        connection.query("SELECT email FROM customer", (err,result, fields)=>{
            if (err) reject(err);
            else{
                resolve(result)
            }
        })
    });
    const filteredUserArray = users.filter(
        (user) => user.email === username
    );
    if(filteredUserArray.length === 0){
        return false;
    }
    else{
        return true;
    }
};

module.exports = {
    getUserbyEmail
};