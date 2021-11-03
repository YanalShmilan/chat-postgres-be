const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const router = require('./router/index');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);
const port = process.env.APP_PORT;
app.use(cors());
app.listen(port, () => {
  console.log(`server running ${port}`);
});
