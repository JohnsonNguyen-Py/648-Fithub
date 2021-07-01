const express = require('express');
const app = express();
var dbconnection = require('./mysqlConnector');

async function getTestingData(callback){
    dbconnection.query('select * from testing', function (err, rows, fields) {
        if (err) throw err
        callback(rows);
    });
}

// hello world
app.get('/', function (req, res) {
  res.send('Welcome to FitHub!!!');
});

app.get('/dbtesting', function(req, res) {
    getTestingData(function(data){
        res.send(data);
    })
});

app.listen(3000);
