const route = require('./router/router');
const express = require("express");







const app = express();
app.use(express.json());
app.use(route);




module.exports = app;
