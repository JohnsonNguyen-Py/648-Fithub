process.env.TZ = "America/Los_Angeles";
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var cookieParser = require('cookie-parser');

var session = require('express-session');
var md5 = require('md5');
const path = require('path');

var multer = require("multer");
var fs = require("fs");
var upload = multer({ dest: path.join(__dirname, "/public/upload") });

var dbconnection = require('./mysqlConnector');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.static(__dirname));

app.use(cookieParser());
app.use(session({
    secret: "fithub.app",
    resave: false,
    saveUninitialized: false
}));

// other functions


app.post('/checkUserLoggedIn', urlencodedParser, function (req, res) {
    // console.log("checkUserLoggedIn:");
    // console.log(req.session);
    if (req.session.loggedIn) {
        res.send({ status: "success", message: "User logged in", data: req.session });
    } else {
        res.send({ status: "failure", message: "guest user", data: {} });
    }
});

//vidhi - api to check for new messages for a user
app.post('/checkNewMessage', urlencodedParser, function (req, res) {
    var user = req.body.userid;
    var sql = "Select is_new_msg from check_new_message where user_id = " + user;
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            dbconnection.query('UPDATE `check_new_message` SET `is_new_msg` = 0 WHERE `user_id` = ' + user, (e, r) => { });
            res.send({ status: "success", message: err, data: result[0] });
        }
    });
});

//vidhi - api to get new messages for a user
app.post('/getNewMessagesDiv', urlencodedParser, function (req, res) {
    var user = req.body.userid;
    var fromuser = req.body.fromid;
    var sql = "Select * from user_messages where to_user_id IN (" + user + "," + fromuser + ") and from_user_id IN (" + user + "," + fromuser + ");";
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            dbconnection.query('UPDATE `user_messages` SET `is_read` = 1 WHERE `to_user_id` = ' + user + ' AND `from_user_id` = ' + fromuser, (e, r) => { });
            res.send({ status: "success", message: 'success', data: result });
        }
    });
});

//vidhi - api to get new messages for a side bar
app.post('/getNewMessagesSide', urlencodedParser, function (req, res) {
    var user = req.body.userid;
    var sql = "SELECT name, from_user_id , max(date_updated) as 'date_updated' FROM user_messages join `registered user` on from_user_id = `registered user`.user_id where to_user_id = " + user + " group by  from_user_id, name";
    dbconnection.query(sql, (err, result) => {
        var data = {};
        if (result && result.length > 0) {
            data['from'] = result;
        };
        var sql2 = "SELECT name, to_user_id , max(date_updated) as 'date_updated' FROM user_messages join `registered user` on to_user_id = `registered user`.user_id where from_user_id = " + user + " group by  to_user_id, name";
        dbconnection.query(sql2, (err2, result2) => {
            if (err2) {
                res.send({ status: "failure", message: err2, data: {} });
            } else {
                if (result && result2.length > 0) {
                    data['to'] = result2;
                };
                if (data.length > 0) {
                    res.send({ status: "success", message: 'success', data: data });
                } else {
                    res.send({ status: "faliure", message: 'no data', data: data });
                }
            }
        });
    });
});

//vidhi - api to send user message
app.post('/sendUserMessage', urlencodedParser, function (req, res) {
    var to_user_id = req.body.to_user_id;
    var from_user_id = req.body.from_user_id;
    var message = req.body.message;
    var sql = 'INSERT INTO `user_messages` (`to_user_id`, `from_user_id`, `message`, `is_read`) VALUES (' + to_user_id + ', ' + from_user_id + ', "' + message + '", 0)';
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            var sql2 = 'UPDATE `check_new_message` SET `is_new_msg` = 1 WHERE (`user_id` = ' + to_user_id + ')';
            dbconnection.query(sql2, (err2, result2) => { });
            res.send({ status: "success", message: 'success', data: {} });
        }
    });
});

//Vidhi - loading user matches data
app.post('/loadMatches', urlencodedParser, function (req, res) {
    var user_id = req.body.userid;
    var sql = 'SELECT workout_id, to_user_id, request_status, date_sent, date_updates, name from `workout request` join `registered user` on `workout request`.to_user_id = `registered user`.user_id where from_user_id = ' + user_id + ' order by date_sent desc';
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            var data = {}
            if (result && result.length > 0) {
                data['sent'] = result;
            }
            var sql2 = 'SELECT workout_id, from_user_id, request_status, date_sent, date_updates, name from `workout request` join `registered user` on `workout request`.from_user_id = `registered user`.user_id where to_user_id = ' + user_id + ' order by date_sent desc';
            dbconnection.query(sql2, (err2, result2) => {
                if (result2 && result2.length > 0) {
                    data['received'] = result2;
                }
                res.send({ status: "success", message: 'success', data: data });
            });
        }
    });
});

//vidhi - update user request status
app.post('/updateRequestStatus', urlencodedParser, function (req, res) {
    var id = req.body.id;
    var status = req.body.status;
    var sql = 'UPDATE `workout request` SET `request_status` = ' + status + ', date_updates = CURRENT_TIMESTAMP() WHERE `workout_id` = ' + id;
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            res.send({ status: "success", message: "Status Updates", data: {} });
        }
    });
});

//vidhi - fetch user info
app.post('/fetchUserInfo', urlencodedParser, function (req, res) {
    var id = req.body.id;
    var sql = 'SELECT * from `registered user` where user_id = ' + id;
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            res.send({ status: "success", message: "Status Updates", data: result });
        }
    });
});

//vidhi - get workoutbuddy recommendation
app.post('/getWorkOutBuddies', urlencodedParser, function (req, res) {
    var user_id = req.body.id;
    var no;
    if (req.body.no) {
        no = req.body.no;
    } else {
        no = 0;
    }
    var sql = '';
    sql = 'SELECT `user_activities`.user_id, name, zip_code, gender, birthdate, activity_type from `user_activities` join `registered user` on  `user_activities`.user_id = `registered user`.user_id where `user_activities`.user_id != ' + user_id + ' and user_activities IN (SELECT user_activities from `user_activities` where user_id = ' + user_id + ' ) LIMIT ' + no + ',1';
    // console.log(sql);
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (result) {
                no++;
                var data = {
                    'no': no,
                    'data': result['0']
                }
                res.send({ status: "success", message: err, data: data });
            } else {
                res.send({ status: "success", message: "No data", data: {} });
            }
        }
    });
});

//vidhi - send workout request
app.post('/sendWorkoutRequest', urlencodedParser, function (req, res) {
    var to_user_id = req.body.to_user_id;
    var from_user_id = req.body.from_user_id;
    var msg = req.body.msg;

    var sql = 'INSERT INTO `workout request` (from_user_id, to_user_id) VALUES (' + from_user_id + ',' + to_user_id + ')';
    var sql1 = 'INSERT INTO `user_messages` (to_user_id, from_user_id, message) VALUES (' + to_user_id + ',' + from_user_id + ', "' + msg + '")';
    var sql2 = 'UPDATE `check_new_message` SET is_new_msg = 1 where user_id = ' + to_user_id;
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            dbconnection.query(sql1, (err1, result1) => {
                if (err1) {
                    res.send({ status: "failure", message: err1, data: {} });
                } else {
                    dbconnection.query(sql2, (err2, result1) => {
                        if (err2) {
                            res.send({ status: "failure", message: err2, data: {} });
                        } else {
                            res.send({ status: "success", message: 'request sent', data: {} });
                        }
                    });
                }
            });
        }
    });
});

app.listen(3000, console.log("Server running on 3000" + new Date().toString()));