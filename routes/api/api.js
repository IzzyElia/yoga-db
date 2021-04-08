const express = require('express');
const fs = require('fs');
const config = require('../../config')
const expressHandlebars = require('express-handlebars');
const authenticator = require('../../authenticatior');
const databaseHook = require('./database');
const schema = require('./databaseSchema');
const { request, response } = require('express');
const router = express.Router();

const newLine = /\r?\n/;
const paragraphBreak = /;/;


const posesDB = new databaseHook(config.posesPath);

//router.use(express.text());

router.get('/help', (request, response) => {
    fs.readFile(path.join(__dirname, 'apihelp.txt'), (error, contents) => {
        if (error) throw error;
        lines = contents.toString().split(paragraphBreak);
        response.render('api-help', {lines});
    })
})

router.get('/pose/:sanskrit', (request, response) => {
    posesDB.getPoseAsObject(request.params.sanskrit)
    .then ((poseObj) => {
        if (poseObj.responseStatus != 200) {
            response.status(poseObj.responseStatus).send('Failed');
        }
        else {
            response.send(JSON.stringify(poseObj));
        }
    })

    //response.render('test', {pageObj});
})

router.get('/index/:idxKey', (request, response) => {
    posesDB.getPosesIndex(request.params.idxKey)
    .then ((results) => {
        if (results.responseStatus != 200) {
            response.status(results.responseStatus).send('Failed');
        }
        else {
            response.send(JSON.stringify(results));
        }
    })

    //response.render('test', {pageObj});
})

router.post('/pose/create/:sanskrit/', (request, response) => {
    dashedSanskrit = request.params.sanskrit.replace(/\s+/g, '_');
    posesDB.addPoseTableIfNotExists(dashedSanskrit, schema.poseEntryKeyslist, request.query.userid)
    .then((result) => {
        response.send(result);
    })
})

router.post('/pose/edit/:sanskrit/:id', (request, response) => {
    posesDB.addPoseTableIfNotExists(request.params.sanskrit.toLowerCase(), schema.poseEntryKeyslist)
    .then((result) => {
        posesDB.updateEdit(request.params.sanskrit.toLowerCase(), request.params.id, request.body.content, request.query.userid);
        response.send();
    })
})

router.post('/pose/add/:sanskrit/:section', (request, response) => {
    posesDB.addPoseTableIfNotExists(request.params.sanskrit.toLowerCase(), schema.poseEntryKeyslist)
    .then((result) => {
        posesDB.addEdit(request.params.sanskrit.toLowerCase(), request.params.section.toLowerCase(), request.body.content, request.query.userid);
        response.send();
    })
})

router.delete('/pose/:sanskrit/:id', (request, response) => {
    posesDB.deleteEdit(request.params.sanskrit.toLowerCase(), request.params.id, request.query.userid);
    response.send();
})

module.exports = router;