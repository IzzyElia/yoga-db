const path = require('path');

class config {
    constructor () {
        this.posesPath = path.join(__dirname, 'routes', 'api', 'databases', 'poses.db');
    }
}

module.exports = new config();