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
                const updateSQL = 'UPDATE `registered user` SET phone = ${phone}, address = ${address}, zip_code = ${zip_code}, brithdate = ${birthdate} WHERE reg_id = ${regID}';
                console.log(updateSQL);
                dbconnection.query(updateSQL, (err, result) => {
                    if (err) {
                        res.send({
                            status: "failure",
                            message: "fail to update profile",
                            data: {},
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
            const dest_dir = path.join(__dirname, "/public/user_picture");
            const dest_file = path.join(
                __dirname,
                "/public/user_picture",
                userID + ".jpg"
            );
            fs.exists(dest_dir, function (exists) {
                if (exists) {
                    fs.rename(source_file, dest_file, function (err) {
                        if (err) {
                            res.send({
                                status: "failure",
                                message: "fail to update profile",
                                data: {},
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
                                data: {},
                            });
                        } else {
                            fs.rename(source_file, dest_file, function (err) {
                                if (err) {
                                    res.send({
                                        status: "failure",
                                        message: "fail to update profile",
                                        data: {},
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
                const updateSQL = 'UPDATE `account` SET password = ' + md5(password) +' WHERE reg_id = ' + regID;
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
    var no = req.body.no;
    var sql = '';
    
    sql = 'SELECT `user_activities`.user_id, `registered user`.reg_id, name, zip_code, gender, birthdate, activity_type from `user_activities` join `registered user` on  `user_activities`.user_id = `registered user`.user_id where `user_activities`.user_id != ' + user_id;
    if (req.body.zip_code) {
        sql += ' and zip_code = "' + req.body.zip_code + '"';
    }
    if (req.body.gender) {
        sql += ' and gender = "' + req.body.gender + '"';
    }
    if (req.body.activity_type) {
        sql += ' and user_activities IN (' + req.body.activity_type + ')';
    } else if (req.body.zip_code || req.body.gender){ 

    } else {
        sql += ' and user_activities IN (SELECT user_activities from `user_activities` where user_id = ' + user_id + ' )';
    }
    sql += ' group by reg_id LIMIT ' + no + ',1';

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

//vidhi - accept workout request
app.post('/acceptWorkoutRequest', urlencodedParser, function (req, res) {
    var to_user_id = req.body.to_user_id;
    var from_user_id = req.body.from_user_id;
    var msg = req.body.msg;
    var tabid = req.body.tabid;

    var sql = 'UPDATE `workout request` SET request_status = 1 where workout_id = '+ tabid;
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

app.listen(3000, console.log("Server running on 3000" + new Date().toString()));