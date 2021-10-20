var mysql = require('mysql2');

var connectionpool = mysql.createPool({
    // connectionLimit : 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
})

module.exports = connectionpool;
