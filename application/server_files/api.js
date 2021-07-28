const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var md5 = require('md5');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var dbconnection = require('./mysqlConnector');

//SESSIONS
var session = require('express-session');
var mysqlSession = require('express-mysql-session')(session);



app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// var mysqlSessionStore = new mysqlSession(
//     {

//         /* using default options */

//     }

//     , require("./mysqlConnector")

// );

// app.use(session({
//     key: "csid",
//     secret: 'key That will sign in cookies',
//     store: mysqlSessionStore,
//     resave: true,
//     saveUninitialized: false
// }));

// hello world
app.get('/', function (req, res) {    
    console.log(req.session); //TESTING SESSIONS
    res.send('Welcome to FitHub!!!');
});

//Register a user
app.post('/registerUser', urlencodedParser, function (req, res) {
    var is_registered = 1, reg_id = 0;
    var guest = {
        email_id: req.body.email_id,
        is_registered: is_registered
    }
    var checkisuserexists = "SELECT * from `guest user` where email_id = '" + guest.email_id + "'";
    dbconnection.query(checkisuserexists, (err, res1) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (res1.length > 0) {
                res.send({ status: "failure", message: "User already exists", data: {} });
            } else {
                var sql = "INSERT INTO `guest user`(email_id, is_registered) VALUES ('" + guest.email_id + "'," + is_registered + ")";
                dbconnection.query(sql, (err, result) => {
                    if (err) {
                        res.send({ status: "failure", message: err, data: {} });
                    } else {
                        var inserted_id = result.insertId;
                        // console.log(inserted_id);
                        if (is_registered == 1) {
                            registeredUser = {
                                user_id: inserted_id,
                                name: req.body.name,
                                gender: req.body.gender,
                                phone: req.body.phone,
                                address: req.body.address,
                                zip_code: req.body.zip_code,
                                birthdate: req.body.birthdate,
                                activity_type: req.body.activity_type
                            };
                            var sql1 = "INSERT INTO `registered user`(user_id, gender, name, birthdate, phone, address, zip_code, activity_type) VALUES (" + registeredUser.user_id + ",'" + registeredUser.gender + "','" + registeredUser.name + "','" + registeredUser.birthdate + "','" + registeredUser.phone + "','" + registeredUser.address + "','" + registeredUser.zip_code + "','" + registeredUser.activity_type + "')";
                            dbconnection.query(sql1, (err1, result1) => {
                                if (err1) {
                                    res.send({ status: "failure", message: err1, data: {} });
                                } else {
                                    reg_id = result1.insertId;
                                    account = {
                                        reg_id: reg_id,
                                        username: req.body.email_id,
                                        password: md5(req.body.password)
                                    }
                                    var sql2 = "INSERT INTO `account`(reg_id, username, password) VALUES (" + account.reg_id + ",'" + account.username + "','" + account.password + "')";
                                    dbconnection.query(sql2, (err2, result2) => {
                                        if (err2) {
                                            res.send({ status: "failure", message: err2, data: {} });
                                        } else {
                                            res.send({ status: "success", message: "User Registered", data: {} });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});

//Save contact us info
app.post('/saveContactUs', urlencodedParser, function (req, res) {
    var data = {
        name: req.body.name,
        email: req.body.email,
        query: req.body.query,
    };
    var sql = "INSERT INTO `contact_us`(name, email, query) VALUES ('" + data.name + "','" + data.email + "', '" + data.query + "')";
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            res.send({ status: "success", message: err, data: {} });
        }
    });
});

app.post('/checkUserLoggedIn', function (req, res) {
    if (req.session.loggedIn) {
        res.send({ status: "success", message: "User logged in", data: {} });
    } else {
        res.send({ status: "failure", message: "guest user", data: {} });
    }
});

app.post('/loginAPI', urlencodedParser, function (req, res) {
    //get username and password
    let email = req.body.email;
    let password = md5(req.body.password);
    //check if user password exists and match
    var checkisuserexists = "SELECT * from `account` where username = '" + email + "'";
    dbconnection.query(checkisuserexists, (err, res1) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (res1.length == 0) {
                res.send({ status: "failure", message: "User does not exists", data: {} });
            } else if (res1.length == 1) {
                if (res1[0].password == password) {
                    //get user info from database
                    var userinfo = "SELECT * from `registered user` where reg_id = " + res1[0].reg_id;
                    dbconnection.query(userinfo, (err, data) => {
                        req.session.save(function (err) {
                            if (err) {
                                res.send({ status: "failure", message: "Cannot create session", data: {} });
                            } else {
                                req.session.loggedIn = true;
                                req.session.data = data[0];

                                req.session.username = username;
                                req.session.reg_id = regId;

                                //console.log("req.session");
                                //console.log(req.session);
                                res.send({ status: "success", message: "Log in successful", data: {} });

                            }
                        });
                    });
                } else {
                    res.send({ status: "failure", message: "Incorrect Password", data: {} });
                }
            } else {
                res.send({ status: "failure", message: "Multiple entries found. Please contact site administrator", data: {} });
            }
        }
    });
});


app.post('/logOut', function (req, res) {
    req.session.destroy((err) => { });
    res.send({ status: "success", message: "user logged out", data: {} });
});

//Save event info
app.post('/saveEvent', urlencodedParser, function (req, res) {
    var data = {
        title: req.body.title,
        description: req.body.description,
        address: req.body.address,
        zipcode: req.body.zipcode,
        from_date: req.body.date,
        to_date: req.body.date,
        start_time: req.body.startTime,
        end_time: req.body.endTime,
        reg_id: 1
    };
    var sql = "INSERT INTO `events`(reg_id, title, description, address, zipcode, from_date, to_date, start_time, end_time) VALUES (" + data.reg_id + ", '" + data.title + "','" + data.description + "','" + data.address + "','" + data.zipcode + "','" + data.from_date + "','" + data.to_date + "','" + data.start_time + "','" + data.end_time + "')";
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            res.send({ status: "success", message: err, data: {} });
        }
    });
});

app.post('/getEvents', urlencodedParser, function (req, res) {
    let keyword = req.body.keyword;
    var sql = "SELECT * FROM `events` WHERE `description` LIKE '%" + keyword + "%'";
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            res.send({ status: "success", message: err, data: result });
        }
    });
});


app.post('/modifyUserInfo', urlencodedParser, function (req, res) {
    if (req.session && req.session.reg_id) {
        const regID = req.session.reg_id;
        const { phone, address, zipCode: zip_code, birthdate } = req.body;
        const userinfo = "SELECT * from `registered user` where reg_id = " + regID;
        dbconnection.query(userinfo, (err, data) => {
            if (err || !(data[0] && data[0].reg_id)) {
                res.send({ status: "failure", message: "unable to find user", data: {} });
            } else {
                const updateSQL = `UPDATE \`registered user\` SET phone = ${phone}, address = ${address}, zip_code = ${zip_code}, brithdate = ${birthdate} WHERE reg_id = ${regID}`;
                dbconnection.query(updateSQL, (err, result) => {
                    if (err) {
                        res.send({ status: "failure", message: 'fail to update profile', data: {} });
                    } else {
                        res.send({ status: "success", message: 'success', data: {} });
                    }
                });
            }
        });
    } else {
        res.send({ status: "failure", message: 'not signed in', data: {} });
    }
})

app.post('/changePassword', urlencodedParser, function (req, res) {
    if (req.session && req.session.reg_id) {
        const regID = req.session.reg_id;
        const { password } = req.body;
        const userinfo = "SELECT * from `registered user` where reg_id = " + regID;
        dbconnection.query(userinfo, (err, data) => {
            if (err || !(data[0] && data[0].reg_id)) {
                res.send({ status: "failure", message: "unable to find user", data: {} });
            } else {
                const updateSQL = `UPDATE \`account\` SET password = ${md5(password)} WHERE reg_id = ${regID}`;
                dbconnection.query(updateSQL, (err, result) => {
                    if (err) {
                        res.send({ status: "failure", message: 'fail to change password', data: {} });
                    } else {
                        res.send({ status: "success", message: 'success', data: {} });
                    }
                });
            }
        });
    } else {
        res.send({ status: "failure", message: 'not signed in', data: {} });
    }
})

app.listen(3000, console.log("Server running on 3000"));