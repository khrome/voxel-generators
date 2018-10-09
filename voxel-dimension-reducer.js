var dims = { x:32*32, y:32, z:1 }

var DimensionReducer = function(dimension, size){
    this.size = size || 32;
    this.offsets = { x:this.size*this.size, y:this.size, z:1 };
    this.axis = this.offsets[dimension];
    delete this.offsets[dimension];
    this.size = size || 32;
};
DimensionReducer.prototype.reduce = function(chunk, reducer, reverse, type){
    var plane = new (type || Int8Array)(this.size*this.size);
    var dims = Object.keys(this.offsets);
    var dimA = this.offsets[dims[0]];
    var dimB = this.offsets[dims[1]];
    var lastBlock;
    var block;
    var shortCircuited;
    for(var lcvA=0; lcvA < this.size; lcvA++){
        for(var lcvB=0; lcvB < this.size; lcvB++){
            shortCircuited = false;
            lastBlock = null;
            var value
            var shortCircuit = function(value){
                shortCircuited = true;
                lastBlock = value;
                return value;
            }
            var size = this.size;
            var init = reverse?size-1:0;
            var mod = reverse?function(n){return n-1;}:function(n){return n+1;};
            var comp = reverse?function(n){return n >= 0;}:function(n){return n<size;};
            for(var lcvC=init; (comp(lcvC) && !shortCircuited); lcvC = mod(lcvC)){
                console.log('??', lcvC)
                if(shortCircuited) continue;
                block = chunk[lcvA*dimA + lcvB*dimB + lcvC*this.axis];
                if(lastBlock !== null) lastBlock = reducer(lastBlock, block, lcvC, shortCircuit)
                else lastBlock = block;
            }
            plane[lcvA * this.size + lcvB] = lastBlock;
        }
    }
    return plane;
}
module.exports = DimensionReducer;
