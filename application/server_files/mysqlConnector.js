var mysql = require('mysql2/promise')

var connectionpool = mysql.createPool({
    // connectionLimit : 10,
    host: '100.26.92.104',
    user: 'teamproject',
    password: 'teamprojectgc07!',
    database: 'teamproject'
})

module.exports = connectionpool;