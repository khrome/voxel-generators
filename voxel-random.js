var rand = require('seed-random');
var Random = {};
Random.seed = function(seed){
    return rand(seed);
}

module.exports = Random;
