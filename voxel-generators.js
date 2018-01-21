var voxel = require('voxel');
var perlin;

function intersectGenerators(a, b, resolve){
    return function(x, y, z){
        var resA = a(x, y, z);
        var resB = b(x, y, z);
        if(resA && resB) return resolve?
            resolve(resA, resB, x, y, z):
            (resA > resB?resA:resB);

    }
}

//Sphere, Noise, DenseNoise, Checker, Hill, Valley, HillyTerrain
var Generators = voxel.generator;
Generators.DenseNoise = Generators['Dense Noise'];
delete Generators['Dense Noise'];
Generators.HillyTerrain = Generators['Hilly Terrain'];
delete Generators['Hilly Terrain'];
Generators.intersection = intersectGenerators;

function stringToCharSum(str){
    var total = 0;
    for (var lcv = 0; lcv < str.length; lcv++) total += str.charCodeAt(lcv);
    return total;
}

//needs to tile seamlessly, but not have to maintain state, so it's expensive!
Generators.SeamlessNoiseFactory = function(seed, GeneratorClass, lower, upper, map){
    var parts = seed.split('|');
    var subX = parts[0];
    var subZ = parts[2];
    var xLowerNoise = GeneratorClass(stringToCharSum((subX-1)+'|'+subX), lower, upper);
    var xUpperNoise = GeneratorClass(stringToCharSum(subX+'|'+(subX+1)), lower, upper);
    var zLowerNoise = GeneratorClass(stringToCharSum((subZ-1)+'|'+subZ), lower, upper);
    var zUpperNoise = GeneratorClass(stringToCharSum(subZ+'|'+(subZ+1)), lower, upper);
    var noise = GeneratorClass(stringToCharSum(subX+':'+subZ), lower, upper);
    // need to compute the intersection of 5 noise maps
    // 4 edges and the main map... inefficient
    // lowers are -16, uppers are +16
    // todo: allow map indexing through an immediate keystore interface
    return function(x, y, z){
        //percentage across current half of axis
        var percentX = x==0?0:x/16;
        var percentZ = z==0?0:z/16;
        var xPart;
        var zPart;
        if(x < 16){
            xPart =
                xLowerNoise(x+16, z) * (1.0 - percentX) +
                noise(x, z) * percentX
        }else{
            xPart =
                xUpperNoise(x-16, z) * percentX +
                noise(x, z) * (1.0 - percentX);
        }
        if(z < 16){
            zPart =
                zLowerNoise(x, z+16) * (1.0 - percentZ) +
                noise(x, z) * percentZ
        }else{
            zPart =
                zUpperNoise(x, z-16) * percentZ +
                noise(x, z) * (1.0 - percentZ);
        }
        var groundLevel =  Math.round((xPart+zPart)/2);
        var result;
        if(y > groundLevel) result = 0;
        if(y === groundLevel) result = 1;
        if(y < groundLevel) result = 2;
        return map?map(x, y, z, result):result;
    }
}

Generators.TiledNoiseFactory = function(seed, algorithm, lower, upper, map){
    var noiseAt = algorithm(seed, lower || 0, upper || 32);
    return function(x, y, z){
        var key = x+'|'+z;
        var groundLevel = noiseAt(x, z);
        var result;
        if(y > groundLevel) result = 0;
        if(y === groundLevel) result = 1;
        if(y < groundLevel) result = 2;
        return map?map(x, y, z, result):result;
    }
}

var rand = require('seed-random');
Generators.Random = {};
Generators.Random.seed = function(seed){
    return rand(seed);
}

var noise = require('perlin').noise;

//var Noise = require('noisejs');

Generators.Noise.perlin = function(){
    var lookup = [];
    return function(seed, min, max){
        if(!min) min = 0;
        if(!max) max = 32;
        var range = max - min;
        noise.seed(seed);
        for(var x=0; x < 32; x++){
            for(var z=0; z < 32; z++){
                lookup[x + z*32] = min + Math.floor(
                    ((noise.perlin2(x/50 , z/50)+1)/2) *  range
                );
            }
        }
        return function(a, b){
            return lookup[a + b*32];
        }
    }
}

Generators.Noise.simplex = function(){
    var lookup = [];
    return function(seed, min, max){
        if(!min) min = 0;
        if(!max) max = 32;
        var range = max - min;
        noise.seed(seed);
        for(var x=0; x < 32; x++){
            for(var z=0; z < 32; z++){
                lookup[x + z*32] = min + Math.floor(
                    ((noise.simplex2(x/50 , z/50)+1)/2) *  range
                );
            }
        }
        return function(a, b){
            return lookup[a + b*32];
        }
    }
}

module.exports = Generators;
