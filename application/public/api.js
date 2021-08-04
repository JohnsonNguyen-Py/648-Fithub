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

                                    const myArr = registeredUser.activity_type.split(",");
                                    var actquerry = "INSERT INTO `user_activities`(user_id, user_activities) VALUES ";
                                    for (var idx in myArr) {
                                        if (idx == (myArr.length - 1)) {
                                            actquerry += "(" + registeredUser.user_id + ",'" + myArr[idx] + "')";
                                        } else {
                                            actquerry += "(" + registeredUser.user_id + ",'" + myArr[idx] + "'),";
                                        }
                                    }
                                    dbconnection.query(actquerry, (err, result) => {
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
                                                    fs.readFile('images/user_picture/user.jpeg', function (err, data) {
                                                        if (err) throw err;
                                                        fs.writeFile('images/user_picture/' + registeredUser.user_id + '.jpeg', data, function (err) {
                                                            if (err) throw err;
                                                        });
                                                    });
                                                    res.send({ status: "success", message: "User Registered", data: {} });
                                                }
                                            });
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
        var checkisuserexists = "SELECT `registered user`.reg_id, `registered user`.user_id, password, phone, address, activity_type, zip_code, gender, name, birthdate, is_active from `account` join `registered user` on `registered user`.reg_id = `account`.reg_id where username = '" + email + "'";
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
                if (res1[0].is_active == 0) {
                    res.send({ status: "failure", message: "User Deactivated. Contact admin to activate account!", data: {} });
                } else if (res1[0].password == password) {
                    resolve(res1);
                } else {
                    res.send({ status: "failure", message: "Incorrect Password", data: {} });
                }
            } else {
                res.send({ status: "failure", message: "Multiple entries found. Please contact site administrator", data: {} });
            }
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


app.get('/logOut', function (req, res) {
    req.session.loggedIn = false;
    req.session.data = {};
    req.session.destroy((err) => { });
    res.sendFile(path.join(__dirname, '/index.html'));
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
        user_id: req.body.user_id
    };
    var sql = "INSERT INTO `events`(user_id, title, description, address, zipcode, from_date, to_date, start_time, end_time) VALUES (" + data.user_id + ", '" + data.title + "','" + data.description + "','" + data.address + "','" + data.zipcode + "','" + data.from_date + "','" + data.to_date + "','" + data.start_time + "','" + data.end_time + "')";
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
    var sql = "SELECT * FROM `events` WHERE from_date > CURRENT_TIMESTAMP() and is_active = 1 and `description` LIKE '%" + keyword + "%'";
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            res.send({ status: "success", message: err, data: result });
        }
    });
});

app.post("/modifyUserInfo", upload.single("picture"), function (req, res) {
    const updateDB = (regID) => {
        const { phone, address, zip_code, birthdate } = req.body;
        const userinfo = "SELECT * from `registered user` where reg_id = " + regID;
        dbconnection.query(userinfo, (err, data) => {
            if (err || !(data[0] && data[0].reg_id)) {
                res.send({
                    status: "failure",
                    message: "unable to find user",
                    data: {},
                });
            } else {
                const updateSQL = 'UPDATE `registered user` SET phone = "' + phone + '", address = "' + address + '", zip_code = "' + zip_code + '", birthdate = "' + birthdate + '" WHERE reg_id = ' + regID;
                dbconnection.query(updateSQL, (err, result) => {
                    if (err) {
                        res.send({
                            status: "failure",
                            message: "fail to update profile",
                            data: err,
                        });
                    } else {
                        res.send({ status: "success", message: "success", data: {} });
                    }
                });
            }
        });
    };

    if (req.session && req.session.data.reg_id) {
        const regID = req.session.data.reg_id, userID = req.session.data.user_id;
        if (req.file) {
            const source_file = req.file.path;
            const dest_dir = path.join(__dirname, "/images/user_picture");
            const dest_file = path.join(
                __dirname,
                "/images/user_picture",
                userID + ".jpeg"
            );
            fs.exists(dest_dir, function (exists) {
                if (exists) {
                    fs.rename(source_file, dest_file, function (err) {
                        if (err) {
                            res.send({
                                status: "failure",
                                message: "fail to update profile",
                                data: err,
                            });
                        } else {
                            updateDB(regID);
                        }
                    });
                } else {
                    fs.mkdir(dest_dir, 0777, function (err) {
                        if (err) {
                            res.send({
                                status: "failure",
                                message: "fail to update profile",
                                data: err,
                            });
                        } else {
                            fs.rename(source_file, dest_file, function (err) {
                                if (err) {
                                    res.send({
                                        status: "failure",
                                        message: "fail to update profile",
                                        data: err,
                                    });
                                } else {
                                    updateDB(regID);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            updateDB(regID);
        }
    } else {
        res.send({ status: "failure", message: "not signed in", data: {} });
    }
});

app.post('/changePassword', urlencodedParser, function (req, res) {
    if (req.session && req.session.data.reg_id) {
        const regID = req.session.data.reg_id;
        const password = req.body.password;
        const userinfo = "SELECT * from `registered user` where reg_id = " + regID;
        dbconnection.query(userinfo, (err, data) => {
            if (err || !(data[0] && data[0].reg_id)) {
                res.send({ status: "failure", message: "unable to find user", data: {} });
            } else {
                const updateSQL = 'UPDATE `account` SET password = "' + md5(password) + '" WHERE reg_id = ' + regID;
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

app.post('/deactiveUser', urlencodedParser, function (req, res) {
    if (req.session && req.session.data.reg_id) {
        const regID = req.session.data.reg_id;
        const userinfo = "SELECT * from `registered user` where reg_id = " + regID;
        dbconnection.query(userinfo, (err, data) => {
            if (err || !(data[0] && data[0].reg_id)) {
                res.send({ status: "failure", message: "unable to find user", data: {} });
            } else {
                const updateSQL = 'UPDATE `registered user` SET is_active = 0 WHERE reg_id = ' + regID;
                dbconnection.query(updateSQL, (err, result) => {
                    if (err) {
                        res.send({ status: "failure", message: 'fail to deactive user', data: {} });
                    } else {

                        req.session.loggedIn = false;
                        req.session.data = {};
                        req.session.destroy((err) => { });
                        res.send({ status: "success", message: 'success', data: {} });
                    }
                });
            }
        });
    } else {
        res.send({ status: "failure", message: 'not signed in', data: {} });
    }
})

app.post('/deleteUser', urlencodedParser, function (req, res) {
    const regID = req.body.reg_id;
    const userinfo = "SELECT * from `registered user` where reg_id = " + regID;
    dbconnection.query(userinfo, (err, data) => {
        if (err || !(data[0] && data[0].reg_id)) {
            res.send({ status: "failure", message: "unable to find user", data: {} });
        } else {
            const updateSQL = 'DELETE FROM `registered user` WHERE reg_id = ' + regID;
            // console.log(updateSQL);
            dbconnection.query(updateSQL, (err, result) => {
                if (err) {
                    res.send({ status: "failure", message: 'fail to delete user', data: {} });
                } else {

                    req.session.loggedIn = false;
                    req.session.data = {};
                    req.session.destroy((err) => { });
                    res.send({ status: "success", message: 'success', data: {} });
                }
            });
        }
    });
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
    var sql = "Select * from user_messages where to_user_id IN (" + user + "," + fromuser + ") and from_user_id IN (" + user + "," + fromuser + ") order by date_updated asc;";
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
    var sql = "SELECT name, from_user_id , max(date_updated) as 'date_updated' FROM user_messages join `registered user` on from_user_id = `registered user`.user_id where to_user_id = " + user + " and `registered user`.is_active = 1 group by  from_user_id, name";
    dbconnection.query(sql, (err, result) => {
        var data = {};
        if (result && result.length > 0) {
            data['from'] = result;
        };
        var sql2 = "SELECT name, to_user_id , max(date_updated) as 'date_updated' FROM user_messages join `registered user` on to_user_id = `registered user`.user_id where from_user_id = " + user + " and `registered user`.is_active = 1 group by  to_user_id, name";
        dbconnection.query(sql2, (err2, result2) => {
            if (err2) {
                res.send({ status: "failure", message: err2, data: {} });
            } else {
                if (result && result2.length > 0) {
                    data['to'] = result2;
                };
                if (data) {
                    res.send({ status: "success", message: 'success', data: data });
                } else {
                    res.send({ status: "faliure", message: 'no data', data: {} });
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
    var sql = 'SELECT workout_id, to_user_id, request_status, date_sent, date_updates, name from `workout request` join `registered user` on `workout request`.to_user_id = `registered user`.user_id where from_user_id = ' + user_id + ' and request_status != 3 and `registered user`.is_active = 1 order by date_sent desc';
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            var data = {}
            if (result && result.length > 0) {
                data['sent'] = result;
            }
            var sql2 = 'SELECT workout_id, from_user_id, request_status, date_sent, date_updates, name from `workout request` join `registered user` on `workout request`.from_user_id = `registered user`.user_id where to_user_id = ' + user_id + ' and request_status != 2 and `registered user`.is_active = 1 order by date_sent desc';
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
    var sql = 'SELECT * from `registered user` where is_active = 1 and user_id = ' + id;
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
    var sql = '';

    sql = 'SELECT `user_activities`.user_id, `registered user`.reg_id, name, zip_code, gender, birthdate, activity_type from `user_activities` join `registered user` on  `user_activities`.user_id = `registered user`.user_id where `user_activities`.user_id != ' + user_id + '  and `registered user`.is_active = 1 ';
    if (req.body.zip_code) {
        sql += ' and zip_code = "' + req.body.zip_code + '"';
    }
    if (req.body.gender) {
        sql += ' and gender = "' + req.body.gender + '"';
    }
    if (req.body.activity_type) {
        sql += ' and user_activities IN (' + req.body.activity_type + ')';
    } else if (req.body.zip_code || req.body.gender) {

    } else {
        sql += ' and user_activities IN (SELECT user_activities from `user_activities` where user_id = ' + user_id + ' )';
    }
    sql += ' group by reg_id';

    // console.log(sql);
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (result) {
                var data = {
                    'data': result
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

app.post('/getWorkoutRequest', urlencodedParser, function (req, res) {
    const regID = req.body.user_id;
    const sql = "SELECT t1.workout_id, t1.from_user_id, t1.to_user_id, t1.date_sent, t2.name from `workout request` t1 LEFT JOIN `registered user` t2 ON t1.from_user_id = t2.user_id WHERE to_user_id = " + regID + " AND request_status = 0";
    dbconnection.query(sql, (err, data) => {
        console.log(err);
        if (err) {
            res.send({ status: "failure", message: "unable to find workout request", data: {} });
        } else {
            res.send({ status: "success", message: 'success', data: data });
        }
    });
})

app.post('/rejectWorkoutRequest', urlencodedParser, function (req, res) {
    if (req.session && req.session.data.reg_id) {
        const regID = req.session.data.user_id;
        const tabid = req.body.tabid;
        const sql = 'DELETE FROM `workout request` WHERE to_user_id = ' + regID + ' AND workout_id = ' + tabid;
        dbconnection.query(sql, (err, data) => {
            console.log(err);
            if (err) {
                res.send({ status: "failure", message: "unable to reject workout request", data: {} });
            } else {
                res.send({ status: "success", message: 'success', data: {} });
            }
        });
    } else {
        res.send({ status: "failure", message: 'not signed in', data: {} });
    }
})

//vidhi - accept workout request
app.post('/acceptWorkoutRequest', urlencodedParser, function (req, res) {
    var to_user_id = req.body.to_user_id;
    var from_user_id = req.body.from_user_id;
    var msg = req.body.msg;
    var tabid = req.body.tabid;

    var sql = 'UPDATE `workout request` SET request_status = 1 where workout_id = ' + tabid;
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
                            res.send({ status: "success", message: 'request accepted', data: {} });
                        }
                    });
                }
            });
        }
    });
});

//vidhi - get event info for all users
app.get('/eventProfileForAll', function (req, res) {
    var id = req.query.id;
    // var sql = "SELECT * FROM `events` WHERE event_id = " + id + " and is_active = 1";
    var sql = "SELECT * FROM `events` WHERE event_id = " + id;
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            var html = '';
            if (result) {
                var info = result[0];
                html = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="description" content="Fithub is a web app for helping people find workout events"><meta name="keywords" content="Fithub, Workout, Friends, Workout Buddies, Events, Workout Events"><title>Events | FitHub</title><!-- BootStrap Scripts --><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet"  integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous"><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js"  integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0"  crossorigin="anonymous"></script><!-- Fonts --><link rel="preconnect" href="https://fonts.gstatic.com"><link  href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Noto+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"  rel="stylesheet"><!-- CSS Stylesheets --><link rel="stylesheet" href="../css/events.css"><link rel="stylesheet" href="../css/CreateEvents.css"><link rel="stylesheet" href="../css/eventProfile.css"><!-- Font Awesome --><script src="https://kit.fontawesome.com/ab3cb519ad.js" crossorigin="anonymous"></script><!-- Favicon --><link rel="icon" href="../images/favicon.ico"><!-- JS --><script defer src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script><script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script></head><body><section class="colored-section" id="ptitle">  <div class="container-fluid">    <!-- Nav Bar -->    <nav class="navbar navbar-expand-lg navbar-dark">      <i class="fas fa-dumbbell fa-2x"></i>      <a class="navbar-brand" href="../index.html">FitHub</a>      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">        <span class="navbar-toggler-icon"></span>      </button>      <div class="collapse navbar-collapse" id="navbarNav">        <ul class="navbar-nav ms-auto"><li class="nav-item"><a class="nav-link" href="../index.html">Home</a></li>        </ul>      </div>    </nav>  </div>  <div class="container">    <div class="side">      <div class="header">        <div class="avatar"><img src="../images/userImg.png" alt="">        </div>        <a class="title" href="#">Events</a>      </div>  </div>  <!-- Events -->  <div class="creatingevent">    <div class="col-lg-8" id="event-info">      <div class="card shadow-sm">        <div class="card-header bg-transparent border-0"><h3 class="mb-0"><i class="far fa-clone pr-1"></i>Event Information</h3>        </div>        <div class="card-body pt-0"><table class="table table-bordered"><tr>  <th width="30%">Event</th>  <td width="2%">:</td>  <td>' + info.title + '</td></tr><tr>  <th width="30%">Location</th>  <td width="2%">:</td>  <td>' + info.address + ' ' + info.zipcode + '</td></tr><tr>  <th width="30%">Start Date</th>  <td width="2%">:</td>  <td>' + info.from_date + '</td></tr><tr>  <th width="30%">End Date</th>  <td width="2%">:</td>  <td>' + info.to_date + '</td></tr><tr>  <th width="30%">Start Time</th>  <td width="2%">:</td>  <td>' + info.start_time + '</td></tr><tr>  <th width="30%">End Time</th>  <td width="2%">:</td>  <td>' + info.end_time + '</td></tr><tr>  <th width="30%">Description</th>  <td width="2%">:</td>  <td>' + info.description + '</td></tr></table>        </div>      </div>    </div></div> </section> </div><!-- Footer --><footer class="white-section" id="footer"><div class="container-fluid"><p>© Copyright 2021 FitHub</p></div></footer></body>';
            } else {
                html = 'Invalid event id';
            }

            res.send(html);
        }
    });
});


//johnson
app.get('/eventProfileForAdmin', function (req, res) {
    var event_id = req.body.event_id;
    var is_active = req.body.is_active;
    var sql = '';

    const updateSQL = 'UPDATE `events` SET is_active =  "' + is_active + '" WHERE event_id = ' + event_id;

    if (req.body.activateEvents == 0) {
        sql = 'SELECT * FROM `events` WHERE event_id = "' + event_id + '" and is_active = 0';
        dbconnection.query(updateSQL, (err, result) => {
            if (err) {
                res.send({ status: "failure", message: err, data: {} });
            } else {
                res.send({ status: "success", message: "Accepted!", data: {} });
            }
        });
    }
});


//EDUARDO 
app.post('/joinDisjoinEvent', urlencodedParser, function (req, res) {
    var user_id = req.body.user_id;
    var event_id = req.body.event_id;
    var acttye = req.body.acttye;
    var is_joined = req.body.is_joined;
    var sql = '';
    if (acttye == "ins") {
        sql = 'INSERT INTO `join_leave_event` (user_id, event_id, is_joined, date_joined) VALUES (' + user_id + ',' + event_id + ', ' + is_joined + ', CURRENT_TIMESTAMP())';
    } else {
        sql = 'UPDATE `join_leave_event` SET is_joined = ' + is_joined + ', date_disjoin = CURRENT_TIMESTAMP() where user_id = ' + user_id + ' and event_id = ' + event_id;
    }
    // console.log(sql);
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} })
        } else {
            res.send({ status: "success", message: 'Event Joined/Disjoined', data: {} });
        }
    });
});

//EDUARDO - fetch events data
app.post('/getEventsData', urlencodedParser, function (req, res) {
    var sql = '';
    if (req.body.showevents == 1) {
        sql = 'SELECT * from events where from_date > CURRENT_TIMESTAMP() and user_id != ' + req.body.id + ' and is_active = 1';
        if (req.body.zip_code) {
            sql += ' and zipcode = "' + req.body.zip_code + '"';
        }
        sql += " order by from_date asc";
    } else {
        sql = 'SELECT * from events where user_id = ' + req.body.id + ' and is_active = 0';
    }
    // console.log(sql);
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (result) {
                res.send({ status: "success", message: err, data: result });
            } else {
                res.send({ status: "failure", message: "No data", data: {} });
            }
        }
    });
});

app.post('/getEventsUserInfo', urlencodedParser, function (req, res) {
    var user_id = req.body.user_id;
    var event_id = req.body.event_id;
    var sql = 'SELECT * from events where event_id = ' + req.body.event_id + ' and is_active = 1';
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (result[0]) {
                var q1 = `SELECT is_joined from join_leave_event where user_id = ${user_id} and event_id = ${event_id}`;
                dbconnection.query(q1, (err1, result1) => {
                    if (err1) {
                        res.send({ status: "failure", message: err1, data: {} });
                    } else {
                        var data = {
                            eventInfo: result[0],
                            userInfo: result1[0]
                        }
                        res.send({ status: "success", message: "", data: data });
                    }
                });
            } else {
                res.send({ status: "failure", message: "Event does not exists", data: {} });
            }
        }
    });
});

app.post('/deleteEvent', urlencodedParser, function (req, res) {
    var user = req.body.user_id;
    var eveid = req.body.eveid;
    if (eveid && user) {
        var q1 = `DELETE from events where user_id = ${user} and event_id = ${eveid}`;
        dbconnection.query(q1, (err1, result1) => {
            if (err1) {
                res.send({ status: "failure", message: err1, data: {} });
            } else {
                res.send({ status: "success", message: err1, data: {} });
            }
        });
    } else {
        res.send({ status: "failure", message: "Missing information to delete event", data: {} });
    }
});

app.post('/getEventsDataAdmin', urlencodedParser, function (req, res) {
    var sql = 'SELECT * from events where user_id != ' + req.body.id + ' and is_active = 0';
    // console.log(sql);
    dbconnection.query(sql, (err, result) => {
        if (err) {
            res.send({ status: "failure", message: err, data: {} });
        } else {
            if (result) {
                res.send({ status: "success", message: err, data: result });
            } else {
                res.send({ status: "failure", message: "No data", data: {} });
            }
        }
    });
});

app.listen(3000, console.log("Server running on 3000" + new Date().toString()));