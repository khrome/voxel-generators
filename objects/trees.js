var Geometry = require('../voxel-relative-geometry')

var Trees = function(options){
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
Trees.prototype.buildGenerator = function(randomFn){
    var random = randomFn || this.options.random;
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
                random()*(upper-lower)
            );
        if(useIndex) groundHeights[index] = result;
        return result;
    }
    var getOccurance = getOccuranceGenerator(trees, this.options.treeRadius || 1);
    return function(x, y, z, value){
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
}

module.exports = Trees;
