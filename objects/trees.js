var Geometry = require('../voxel-relative-geometry');
var Objects = require('../voxel-objects');

//trees predate the AbstractObject so they're special for now
/*var Trees = function(options){
    this.options = options || {};
    if(!this.options.width) this.options.width = 32;
    if(!this.options.height) this.options.height = 32;
    if(!this.options.treeRadius) this.options.treeRadius = 1;
    if(!(
        this.options.groundHeightHigh &&
        this.options.groundHeightLow
    )){
        this.options.groundHeight = 32;
    }
    //seedless random... non-deterministic :P (pass one in)
    if(!this.options.random) throw new Error('options.random is required!');
    //if(!this.options.random) this.options.random = require('../random')();
    this.trees = [];
    this.maxGround = (this.options.groundHeight||this.options.groundHeightHigh);
}

Trees.prototype.addTree = function(x, z, height, diameter, type){
    if(!this.options.noBoundaries){
        var r = diameter/2;
        if(x - r < 0) return false;
        if(x + r >= 32) return false;
        if(z - r < 0) return false;
        if(z + r >= 32) return false;
    }
    this.trees[x + z*32] = Math.floor(
        (this.maxGround+1)+ // 1 above ground offset
        this.options.random()*(height-this.maxGround) // remaining height randomize
    );
}

var getOccuranceGenerator = Geometry.ocurranceOfSquareContainingGenerator;

Trees.prototype.createOptions = function(randomFn, callback){
    var groundHeights = [];
    var trees = this.trees;
    var rand;
    var lower = this.options.groundHeightLow || 8;
    var upper = this.options.groundHeightHigh || 12;
    var treeTops = this.options.treeHeight || 25;
    var ob = this;
    var groundAt = function(x, z, useIndex){
        // slightly janky as we have to deterministicly pick a branch
        // height without knowing the ground height ::crosses fingers::
        var index = x + z*32;
        if(useIndex && groundHeights[index]) return groundHeights[index];
        var result = ob.options.groundHeight?
            ob.options.groundHeight:
            lower + Math.floor( //let's take a guess
                randomFn()*(upper-lower)
            );
        if(useIndex) groundHeights[index] = result;
        return result;
    }
    callback(groundHeights, trees, lower, upper, treeTops, groundAt);
}

Trees.prototype.writeInto = function(randomFn, chunk, dontOverwrite){
    var random = randomFn || this.options.random;
    var v = function(x, y, z, value){
        var offset = x *32*32 + y *32 + z;
        if(value && dontOverwrite && chunk[offset]) return chunk[offset];//already has a value
        if(value) return (chunk[offset] = value);
        else return chunk[offset];
    }
    var result;
    var ob = this;
    this.createOptions(random, function(groundHeights, trees, lower, upper, treeTops, groundAt){
        var getOccurance = getOccuranceGenerator(trees, ob.options.treeRadius || 1);
        for(var x=0; x < 32; x++){
            for(var z=0; z < 32; z++){
                var treeHeight = trees[x + z*32];
                var groundHeight = upper;
                if(treeHeight){
                    for(var y=lower; y <= treeHeight; y++){
                        if(!v(x, y, z)){
                            if(y === treeHeight){
                                v(x, y, z, 4);
                            }else{
                                v(x, y, z, 3);
                            }
                        }
                        var branchHeight = groundHeight + 2;
                        if(
                            y > branchHeight &&
                            y < treeHeight &&
                            (y-branchHeight) % 3 === 0
                        ){
                            var coords = Geometry.cube(2);
                            coords.forEach(function(coord){
                                v(x+coord[0], y+coord[1], z+coord[2], 4, true);
                            })
                        }
                    }
                }
            }
        }
    });
}

Trees.prototype.buildGenerator = function(randomFn){
    var random = randomFn || this.options.random;
    var result;
    var ob = this;
    console.log('??');
    var coords = Geometry.cube(2);
    coords.forEach(function(coord){
        v(x+coord[0], y+coord[1], z+coord[2], 4, true);
    })
    this.createOptions(random, function(groundHeights, trees, lower, upper, treeTops, groundAt){
        var getOccurance = getOccuranceGenerator(trees, ob.options.treeRadius || 1);
        result = function(x, y, z, value){
            if(value) return value;
            var treeHeight = trees[x + z*32];
            //the trunk & top leaves
            if(value === 0 && treeHeight && treeHeight >= y){
                if(treeHeight > y) return 3;
                if(treeHeight == y) return 4;
            }
            //branches
            var groundHeight;
            treeHeight = getOccurance(x, y, z, function(treeX, treeZ){
                groundHeight = groundAt(treeX, treeZ, true);
            });
            if(!(treeHeight && groundHeight)) return value;
            var branchHeight = groundHeight + 2;
            if(
                (value === 0) && //don't overwite voxels
                y > branchHeight &&
                y < treeHeight
            ){
                var test = (y-branchHeight) % 3 === 0;// ~2 clumps per tree
                if(test) return 4;
            }
            return value;
        }
    })
    console.log('!!', result);
    return result;
}



module.exports = Trees;*/

module.exports = Objects.implement({
    build : function(config, context){
        if(!(
            config.x !== undefined &&
            config.y !== undefined &&
            config.height !== undefined &&
            config.z !== undefined
        )){
            console.log(config);
            throw new Error('trees require x, y, z, height');
        }
        var base = Math.floor(config.height * 0.5);
        var variable = Math.floor(context.random()*(config.height-base));
        var coords = [];
        var top = base+variable;
        var offset = Math.floor(context.random()*3);
        for(var lcv=0; lcv< top; lcv++){
            if( (lcv-offset)%5 == 0  && lcv > base + offset){
                coords = Geometry.cube(3, true).map(function(coords){
                    return [config.x+coords[0], config.y+lcv+coords[1], config.z+coords[2], config.leaves || 4]
                }).concat(coords);
            }
            if(lcv === top-1) coords.push([config.x, config.y+lcv, config.z, config.leaves || 4])
            else coords.push([config.x, config.y+lcv, config.z, config.trunk || 3])
        }
        return coords;
    },
    createOptions : function(context, callback){
        callback(undefined, {});
    }
});
