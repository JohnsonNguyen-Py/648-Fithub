var express = require("express");
var router = express.Router();
//var bcrypt = require('bcrypt');
// var db = require("application\public\server_files\mysqlConnector.js");
// var UserError = require("application\public\helpers\UserError.js");

// /* GET users listing. */
// // router.get('/', function(req, res, next) {
// //   res.send('respond with a resource');
// // });


// router.post('/register', (req, res, next) => {
//     //console.log("post Register")
//     let username = req.body.Username;
//     let password = req.body.Password;
//     let email = req.body.Email;
//     //console.log("test")
//     //console.log(username)

//     db.execute("SELECT * FROM users WHERE username =?", [username])
//         .then(([results, fields]) => {
//             //console.log("Execute 1"); // testing ignore
//             if (results && results.length == 0) {
//                 return db.execute("SELECT * FROM users WHERE email =?", [email])
//             } else {
//                 throw new UserError(
//                     "Registration failed: Username already exists"
//                 )
//                 "/registration", 200
//             }
//         })
//         .then(([results, fields]) => {
//             if (results && results.length == 0) {
//                 return bcrypt.hash(password, 13);
//             } else {
//                 throw new UserError(
//                     "Registration failed: Email already exists"
//                 )
//                 "/registration", 200
//             }
//         }) //BCRYPT HASHES PASSWORDS

//         .then((hashedPassword) => {
//             //console.log("Execute 2"); // testing ignore
//             //console.log(password, email, username); // testing ignore

//             let baseSQL = "INSERT INTO users(username, email, password, created) VALUES (?,?,?,now());"
//             return db.execute(baseSQL, [username, email, hashedPassword]);
//         })
//         .then(([results, fields]) => {
//             //console.log("Execute 3"); // testing ignore
//             //console.log(results);  // testing ignore
//             if (results && results.affectedRows) {
//                 successPrint("User.js --> User was created!");
//                 res.redirect("/login");
//             } else {
//                 throw new UserError(
//                     "Server Error, User not be created",
//                     "/registration",
//                     500
//                 );
//             }
//         })
//         .catch((err) => {
//             errorPrint("User could not made", err);
//             next(err);
//             if (err instanceof UserError) {
//                 errorPrint(err.getMessage());
//                 res.status(err.getStatus());
//                 res.redirect(err.getRedirectURl());
//             } else {
//                 next(err);
//             }
//         });
// });

module.exports = router;
