var voxel = require('voxel');
var SimplexNoise;
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
    for (var lcv = 0; lcv < str.length; lcv++) total += alphabet[str[lcv]];
    return total;
}

//needs to tile seamlessly, but not have to maintain state, so it's expensive!
Generators.SeamlessNoiseFactory = function(subX, subY, subZ, GeneratorClass, lookup){
    var xLowerNoise = GeneratorClass(stringToCharSum((subX-1)+'|'+subX));
    var xUpperNoise = GeneratorClass(stringToCharSum(subX+'|'+(subX+1)));
    var zLowerNoise = GeneratorClass(stringToCharSum((subZ-1)+'|'+subZ));
    var zUpperNoise = GeneratorClass(stringToCharSum(subZ+'|'+(subZ+1)));
    var noise = GeneratorClass(stringToCharSum(subX+':'+subZ));
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
                xLowerNoise(x+16, z) * (1.0 - precentX) +
                noise(x, z) * precentX
        }else{
            xPart =
                xUpperNoise(x-16, z) * precentX +
                noise(x, z) * (1.0 - precentX);
        }
        if(z < 16){
            zPart =
                zLowerNoise(x, z+16) * (1.0 - precentZ) +
                noise(x, z) * precentZ
        }else{
            zPart =
                zUpperNoise(x, z-16) * precentZ +
                noise(x, z) * (1.0 - precentZ);
        }
        return Math.round((xPart+zPart)/2);
    }
}

Generators.TiledNoiseFactory = function(seed, algorithm, lower, upper){
    var generator = algorithm(seed);
    var bottom = lower || 0;
    var top = upper || 32;
    var ys = {};
    return function(x, y, z){
        var key = x+'|'+z;
        if(!ys[key]){
            var rand = generator(x, z); //-1:1 -> 0:1
            ys[key] = lower + (rand * (upper-lower));
        }
        var groundLevel = ys[key];
        if(y > groundLevel) return 0;
        if(y === groundLevel) return 1;
        return 2;
    }
}

var rand = require('random-seed');
Generators.Random = {};
Generators.Random.seed = function(seed){
    return rand.create(seed);
}

var noise = require('perlin').noise;

Generators.Noise.perlin = function(){
    var lookup = [];
    return function(seed){
        noise.seed(seed);
        for(var x=0; x < 32; x++){
            for(var z=0; z < 32; z++){
                lookup[x + z*32] = noise.perlin2(x , z);
            }
        }
        return function(a, b){
            return lookup[a + b*32];
        }
    }
}

module.exports = Generators;
