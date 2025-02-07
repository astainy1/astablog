const express = require('express');
const app = express;
const mySQL = require('mysql2');
require('dotenv').config; //Using environment variables

const dbConnection = mySQL.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    }
);

dbConnection.connect((err) => {
    if(err){
        console.log('Error connecting to database: ' + err.message);
    }else{
        console.log(`Successfully connected to database`)
    }
});

module.exports = dbConnection;