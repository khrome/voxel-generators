var geometry = {};

geometry.renderChunk = function(generator, chunkSize){
    var size = chunkSize || 32;
    var chunk = new Int8Array(size*size*size);
    var xOffset;
    var yOffset;
    for(var x=0; x < size; x++){
        xOffset = x*size*size;
        for(var y=0; y < size; y++){
            yOffset = y*size;
            for(var z=0; z < size; z++){
                chunk[xOffset + yOffset + z] = generator(x, y, z);
            }
        }
    }
    return chunk;
};

geometry.writeIntoChunk = function(shapes, chunk, incomingChunkSize){
    var chunkSize = incomingChunkSize || 32;
    var numShapes;
    var shapeIndex;
    var shape;
    var numCoords;
    var coordIndex;
    var coord;
    var index;
    numShapes = shapes.length;
    shapeIndex = 0;
    var seen = [];
    for(;shapeIndex < numShapes; shapeIndex++){
        shape = shapes[shapeIndex];
        numCoords = shape.length;
        coordIndex = 0;
        for(;coordIndex < numCoords; coordIndex++){
            coord = shape[coordIndex];
            index = coord[0]*chunkSize*chunkSize +
                coord[1]*chunkSize +
                coord[2];
            if(seen.indexOf(index) === -1){
                chunk[index] = coord[3] || chunk[index] || 0;
            }
            seen.push(index); //only try to write into spaces we haven't seen
        }
    }
    return chunk;
};

module.exports = geometry;
