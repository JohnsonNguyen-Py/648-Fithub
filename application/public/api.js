const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var cookieParser = require('cookie-parser');

var session = require('express-session');
var md5 = require('md5');
const path = require('path');

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

// hello world
app.get('/', function (req, res) {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, '/html/myProfile.html'));
    } else {
        res.sendFile(path.join(__dirname, '/index.html'));
    }
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
                                    var sql2 = "INSERT INTO `account`(reg_id, username, password) VALUES (" + account.reg_id + ",'" + account.username + "','" + account.password + "');";
                                    dbconnection.query(sql2, (err2, result2) => {
                                        dbconnection.query("INSERT INTO `check_new_message` (user_id) VALUES (" + registeredUser.user_id + ");", (err3, result3) => {
                                            if (err3) {
                                                res.send({ status: "failure", message: err2, data: {} });
                                            } else {
                                                res.send({ status: "success", message: "User Registered", data: {} });
                                            }
                                        });
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

app.post('/checkUserLoggedIn', urlencodedParser, function (req, res) {
    // console.log("checkUserLoggedIn:");
    // console.log(req.session);
    if (req.session.loggedIn) {
        res.send({ status: "success", message: "User logged in", data: req.session });
    } else {
        res.send({ status: "failure", message: "guest user", data: {} });
    }
});

app.post('/loginAPI', urlencodedParser, function (req, res) {
    //get username and password
    let email = req.body.email;
    let password = md5(req.body.password);
    function checkuserExists() {
        var checkisuserexists = "SELECT * from `account` where username = '" + email + "'";
        return new Promise(resolve => {
            dbconnection.query(checkisuserexists, (err, res1) => {
                if (err) {
                    res.send({ status: "failure", message: err, data: {} });
                } else {
                    resolve(res1);
                }
            });
        });
    }
    checkuserExists().then(res1 => {
        return new Promise(resolve => {
            if (res1.length == 0) {
                res.send({ status: "failure", message: "User does not exists", data: {} });
            } else if (res1.length == 1) {
                if (res1[0].password == password) {
                    resolve(res1[0].reg_id);
                } else {
                    res.send({ status: "failure", message: "Incorrect Password", data: {} });
                }
            } else {
                res.send({ status: "failure", message: "Multiple entries found. Please contact site administrator", data: {} });
            }
        });
    }).then(uid => {
        return new Promise(resolve => {
            var userinfo = "SELECT * from `registered user` where reg_id = " + uid;
            dbconnection.query(userinfo, (err, data) => {
                if (err) {
                    res.send({ status: "failure", message: err, data: {} });
                } else {
                    resolve(data);
                }
            });
        });
    }).then(data => {
        return new Promise(resolve => {
            if (data.length > 0) {
                req.session.loggedIn = true;
                req.session.data = data[0];
                req.session.save(function (err) {
                    if (err) {
                        resolve("failure");
                    } else {
                        resolve("success");
                    }
                });

            } else {
                resolve("failure");
            }
        });
    }).then(status => {
        if (status == "success") {
            // console.log("logged in:");
            // console.log(req.session);
            res.send({ status: "success", message: "Log in successful", data: {} });
        } else {
            res.send({ status: "failure", message: "No user data found", data: {} });
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

app.listen(3000, console.log("Server running on 3000"));