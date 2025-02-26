// Database connection setup

const mySQL = require('mysql2');

//Using environment variables
require('dotenv').config();

const dbConnection = mySQL.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    }
);

dbConnection.connect((err) => {
    // console.log(process.env.DB_USER)
    if(err){
        console.log('Error connecting to database: ' + err.message || err.stack || err);
        return;
    }else{
        console.log(`Successfully connected to database: ${process.env.DB_DATABASE}`);
    }
});

module.exports = dbConnection;