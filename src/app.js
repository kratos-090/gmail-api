const route = require('./router/router');
const express = require("express");

const checkMail = require('./crons/cronJob');



const app = express();
app.use(express.json());
app.use(route);
checkMail.start();



module.exports = app;
