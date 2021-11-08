const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const router = require('./router/index');
const app = express();
const path = require('path');
const http = require('http');
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use('/upload', express.static(path.join(__dirname, 'upload')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

const port = process.env.APP_PORT;
const server = http.createServer(app);
const SocketServer = require('./socket/index');
SocketServer(server);
server.listen(port, () => {
  console.log(`server running ${port}`);
});
