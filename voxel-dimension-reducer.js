var dims = { x:32*32, y:32, z:1 }

var DimensionReducer = function(dimension, size){
    this.size = size || 32;
    this.offsets = { x:this.size*this.size, y:this.size, z:1 };
    this.axis = this.offsets[dimension];
    delete this.offsets[dimension];
    this.size = size || 32;
};
DimensionReducer.prototype.reduce = function(chunk, reducer){
    var plane = new Int8Array(this.size*this.size);
    var dims = Objects.keys(this.offsets);
    var dimA = this.offsets[dims[0]];
    var dimB = this.offsets[dims[1]];
    var lastBlock;
    var block;
    var shortCircuit = function(value){
        shortCircuited = true;
        return value;
    }
    for(var lcvA=0; lcvA < this.size; lcvA++){
        for(var lcvB=0; lcvB < this.size; lcvB++){
            shortCircuited = false;
            lastBlock = null;
            for(var lcvC=0; (lcvC < this.size && !shortCircuited); lcvC++){
                block = chunk[lcvA*dimA + lcvB*dimB + lcvC*this.axis];
                if(lastBlock) lastBlock = reducer(lastBlock, block, shortCircuit)
                else lastBlock = block;
            }
            plane[lcvA * this.size + lcvB] = lastBlock;
        }
    }
    return plane;
}
module.exports = DimensionReducer;
