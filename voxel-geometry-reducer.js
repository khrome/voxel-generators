var geometry = require('./voxel-absolute-geometry');
var relative = require('./voxel-relative-geometry');

var GeneratorReducer = function(){
    this.fns = [];
};
GeneratorReducer.prototype.add = function(item){
    this.fns.push(item);
}
GeneratorReducer.prototype.reduced = function(parentFn, mapper){
    var ob = this;
    return function(x, y, z){
        var result;
        for(var lcv=0; lcv < ob.fns.length; lcv++){
            result = ob.fns[lcv](x, y, z);
            if(result) return mapper?mapper(result):result;
        }
        return parentFn?(mapper?mapper(parentFn(x, y, z)):parentFn(x, y, z)):0;
    }
}


var GeometryReducer = function(incomingChunk){
    var ob = this;
    var thisChunk;
    this.chunk = function(){
        return thisChunk || (
            thisChunk = (
                typeof incomingChunk==='function'?
                geometry.renderChunk(incomingChunk, 32):
                incomingChunk
            )
        );
    };
    this.generator = function(mapper){
        return typeof incomingChunk==='function'?(
            mapper?
            function(x, y, z){ return mapper(incomingChunk(x, y, z))}:
            incomingChunk
        ):function(x, y, z){
            return incomingChunk[x*32*32 + y*32 + z];
        }
    }
    this.objects = [];
}
GeometryReducer.GeneratorReducer = GeneratorReducer;

GeometryReducer.prototype.add = function(ob){
    this.objects.push(ob);
};

GeometryReducer.prototype.calculated = function(context, mapper){
    var ob = this;
    return function(){
        var chunk = ob.chunk().slice(0);
        var generators = new GeneratorReducer();
        var objs = ob.objects.forEach(function(voxelObject){
            generators.add(voxelObject.buildGenerator(context));
        });
        return generators.reduced(ob.generator(), mapper);
    }
};
GeometryReducer.prototype.integrated = function(context, mapper){
    var ob = this;
    return function(){
        var chunk = ob.chunk().slice(0);
        ob.objects.forEach(function(o){
            if(o.writeInto){
                chunk = o.writeInto(context, chunk);
            }else{
                if(Array.isArray(o)){
                    chunk = geometry.writeIntoChunk(o, chunk, 32);
                }else{
                    throw new Error('other methods unsupported')
                }
            }
         });
         if(mapper){
             for(var lcv=0; lcv < chunk.length; lcv++){
                 chunk[lcv] = mapper(chunk[lcv]);
             }
         }
        return chunk;
    }
};

function generateSubmesh(gen){
    return geometry.renderChunk(gen, 32);
}
GeometryReducer.generateSubmesh = generateSubmesh;
module.exports = GeometryReducer;
