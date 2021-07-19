const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var md5 = require('md5');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

var dbconnection = require('./mysqlConnector');

async function getTestingData(callback) {
    dbconnection.query('select * from testing', function (err, rows, fields) {
        if (err) throw err
        callback(rows);
    });
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  
// hello world
app.get('/', function (req, res) {
    res.send('Welcome to FitHub!!!');
});

app.get('/dbtesting', function (req, res) {
    getTestingData(function (data) {
        res.send(data);
    })
});

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
                                gender: req.body.gender,
                                phone: req.body.phone,
                                address: req.body.address,
                                zip_code: req.body.zip_code,
                                activity_type: req.body.activity_type
                            };
                            var sql1 = "INSERT INTO `registered user`(user_id, gender, phone, address, zip_code, activity_type) VALUES (" + registeredUser.user_id + ",'"+registeredUser.gender+"','" + registeredUser.phone + "','" + registeredUser.address + "','" + registeredUser.zip_code + "','" + registeredUser.activity_type + "')";
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

app.listen(3000);
