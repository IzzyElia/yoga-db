const databaseHook = require('../api/database');
const express = require('express');
const config = require('../../config');
const fs = require('fs');
const path = require('path');
const expressHandlebars = require('express-handlebars');
const authenticator = require('../../authenticatior');
const { response } = require('express');

const router = express.Router();
const newLine = /\r?\n/;
const paragraphBreak = /;/;

const posesDB = new databaseHook(config.posesPath);

router.get('/:sanskrit', (request, response) => {
    posesDB.getPoseAsObject(request.params.sanskrit).then((poseObj) => {
        if (poseObj.responseStatus != 200) {
            response.render('error-page', {status : poseObj.responseStatus});
        }
        else {
            response.render('pose', {poseObj})
        }
    })
})

module.exports = router;