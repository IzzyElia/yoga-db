const eventEmitter = require('events')

class Emitter extends eventEmitter {}

emitter = new Emitter ();

module.exports = emitter;