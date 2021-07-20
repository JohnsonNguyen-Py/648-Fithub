const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var md5 = require('md5');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var dbconnection = require('./mysqlConnector');

//SESSIONS
var sessions = require('express-session');
var mysqlSessions = require('express-mysql-session')(sessions);


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(sessions({
    secret: 'Keep it secret'
    , name: 'fithubSession'
    , saveUninitialized: false
}));


// hello world
app.get('/', function (req, res) {
    console.log(req.sessions); //TESTING SESSIONS
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
            res1.send({ status: "failure", message: err, data: {} });
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

app.post('/loginAPI', bodyParser.urlencoded(), function (req, res) {

    let email = req.body.email;
    let password = md5(req.body.password);
    var checkisuserexists = "SELECT * from `account` where username = '" + email + "'";
    dbconnection.query(checkisuserexists, (err, res1) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (res1.length == 0) {
                res.send({ status: "failure", message: "User does not exists", data: {} });
            } else if (res1.length == 1) {
                if (res1[0].password == password) {
                    var userinfo = "SELECT * from `registered user` where reg_id = " + res1[0].reg_id ;
                    dbconnection.query(userinfo, (err, data) => {
                        req.session.loggedIn = true;
                        req.session.data = data[0];
                        res.send({ status: "success", message: "Log in successful", data: {} });
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

app.post('/logOut', function(req, res) {
    req.session.destroy((err) => {});
    res.send({status: "success" , message: "user logged out", data :{}});
});

// app.use(sessions({
//     store: mysqlSessionStore,
//     secret: "csc648",
//     resave: false,
//     saveUninitialized: false

// }));

// app.post('/login'), urlencodedParser, (req, res) => {
//     let Username = req.body.Username;
//     let Password = req.body.Password;
// };

app.listen(3000);






/*
app.get('/dbtesting', function (req, res) {
    getTestingData(function (data) {
        res.send(data);
    })
});

async function getTestingData(callback) {
    dbconnection.query('select * from testing', function (err, rows, fields) {
        if (err) throw err
        callback(rows);
    });
}*/