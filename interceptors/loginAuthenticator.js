const { query, json } = require("express");
const { connect } = require("../connection");
let connection = require("../connection");


const jsonfile = require("jsonfile");
const users = "./database/users.json";

// getUserbyEmail = async (username) =>{
//     const users = await new Promise((resolve, reject) => {
//         connection.query("SELECT email FROM customer", (err,result, fields)=>{
//             if (err) reject(err);
//             else{
//                 resolve(result)
//             }
//         })
//     });
//     const filteredUserArray = users.filter(
//         (user) => user.email === username
//     );
//     return filteredUserArray.length === 0;
// };

authenticateUser = async function(username,password){
    const user = await getUserByUsername(username);
    if (user){
        return (password === user.password);
    }
    else{
        return false;
    }
};

getUserType = async function(username){
    const allUsers = await jsonfile.readFile(users);
    const filteredUserArray = allUsers.filter(
        (user) => user.username === username
    );
    return filteredUserArray.length === 0 ? null : filteredUserArray[0].userType;
};

getUserByUsername = async function (username){
    const allUsers = await jsonfile.readFile(users);
    const filteredUserArray = allUsers.filter(
        (user) => user.username === username
    );
    return filteredUserArray.length === 0 ? null : filteredUserArray[0];
}

module.exports = {
    authenticateUser,
    getUserByUsername,
    getUserType
};