const express = require('express');
const server = express();
const expressHandlebars = require('express-handlebars');
const passportGoogle = require('passport-google-oauth');
const path = require('path');
const api = require('./routes/api/api');
const view = require('./routes/view/view');
const http = require('http').Server(server);
const io = require('socket.io')(http);
const eventController = require('./event-controller');
const databaseHook = require('./routes/api/database');

const port = process.env.PORT || 8000;
//handlebars view
server.engine('handlebars', expressHandlebars({defaultLayout: 'index'}));
server.set('view engine', 'handlebars');
let hbs = expressHandlebars.create({});

hbs.handlebars.registerHelper('stringify', (obj) => {
    return JSON.stringify(obj);
})
hbs.handlebars.registerHelper('underscoreToSpace', (str) => {
    uStr = str.replace(/_/g, ' ');
    return uStr;
})

server.use(express.static(path.join(__dirname, 'public')))

//body parser
//server.use(express.json());
server.use(express.json());

server.use('/api', api);
server.use('/view', view);


server.get('/', (request, response) => {
    response.render('main');
})

io.on('connection', (socket) => {
    console.log (`User connected`);
    socket.on('disconnect', () => {
        console.log(`User disconnected`);
    })
})

eventController.on('poses-database-modified', (table, id, content, method, user) => {
    console.log(`event received ${table} ${id} ${content} ${method} ${user}`);
    io.emit('poses-database-modified', table, id, content, method, user);
})

http.listen(port);
console.log(`Server running on port ${port}`);