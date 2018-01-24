var voxel = require('voxel');

//Sphere, Noise, DenseNoise, Checker, Hill, Valley, HillyTerrain
var Generators = voxel.generator;
Generators.DenseNoise = Generators['Dense Noise'];
delete Generators['Dense Noise'];
Generators.HillyTerrain = Generators['Hilly Terrain'];
delete Generators['Hilly Terrain'];
Generators.intersection = function(a, b, resolve){
    return function(x, y, z){
        var resA = a(x, y, z);
        var resB = b(x, y, z);
        if(resA && resB) return resolve?
            resolve(resA, resB, x, y, z):
            (resA > resB?resA:resB);

    }
}

var combinations2D = function(arr){ //omits 0, 0
    var a;
    var b;
    var results = [];
    var len = arr.length;
    for(a=0; a < len; a++){
        for(b=0; b < len; b++){
            if(! (
                a === 0 && b === 0
            )) results.push([arr[a], arr[b]]);
        }
    }
    return results;
}

var allSquareDistances = function(maxDistance){
    var distances = [];
    distances.push(0);
    for(var lcv =1; lcv <= maxDistance; lcv++){
        distances.push(lcv);
        distances.push(-1 * lcv);
    }
    return distances;
}
var edgeSquareDistances = function(maxDistance){
    var distances = [];
    distances.push(0);
    for(var lcv =1; lcv <= maxDistance; lcv++){
        distances.push(lcv);
        distances.push(-1 * lcv);
    }
    distances.distances.filter(function(item){
        Math.abs(item[0]) === 4 || Math.abs(item[0]) === 4
    })
    return distances;
}

var relativeToOccurances2D = function(x, z, geometry, locations, tileSize, cb){
    var pos;
    var lcv;
    var test;
    var xx;
    var zz;
    //todo: some wierdness if objects are too close
    //eventually multi-select or limit closeness
    for(lcv =0; lcv <= geometry.length; lcv++){
        xx = x+geometry[lcv][0];
        zz = z+geometry[lcv][1];
        test = locations[xx + yy * tileSize] || 0;
        if(test){
            if(cb) cb(xx,zz);
            return test;
        }
    }
}

Generators.Geometry = {};
Generators.Geometry.Relative = {};


Generators.RelativeGeometry = require('./voxel-relative-geometry');
Generators.Random = require('./voxel-random');
Generators.Noise = require('./voxel-noise');
Generators.TiledNoiseFactory = Generators.Noise.TileFactory;
Generators.SeamlessNoiseFactory = Generators.Noise.BlendedTileFactory;
Generators.Objects = require('./voxel-objects');

module.exports = Generators;
