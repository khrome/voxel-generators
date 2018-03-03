var Objects;
var extend = require('extend')

var AbstractObjects = function(){
    this.objects = [];
};

AbstractObjects.implement = function(cls){
    var cons = typeof cls == 'function'?cls:function(){};
    var syntheticConstructor = function(){
        cons.apply(this, arguments)
        AbstractObjects.apply(this, arguments);
    }
    var clone = extend(AbstractObjects.prototype);
    syntheticConstructor.prototype = clone;
    syntheticConstructor.constructor = syntheticConstructor;
    Object.keys(cls.prototype || cls).forEach(function(key){
        syntheticConstructor.prototype[key] = (cls.prototype || cls)[key];
    });
    return syntheticConstructor;
};

AbstractObjects.prototype.build = function(configuration){
    throw new Error('Build must be implemented!');
    // returns [][]
};

AbstractObjects.prototype.add = function(configuration){
    this.objects.push(configuration);
};

AbstractObjects.prototype.createOptions = function(context, callback){
    callback(undefined, {})
};

var options;
AbstractObjects.prototype.getOptions = function(context, callback){
    if(options){
        return callback(undefined, options);
    }else{
        this.createOptions(context, function(err, options){
            return callback(undefined, options);
        });
    }
};

AbstractObjects.prototype.writeInto = function(context, chunk, dontOverwrite){
    var ob = this;
    var objects = this.objects.map(function(o){ return ob.build(o, context); });
    this.getOptions(context, function(config){
        var object;
        var g;
        var index;
        for(var lcv=0; lcv< objects.length; lcv++){
            object = objects[lcv];
            for(var gPos=0; gPos<object.length; gPos++){
                g = object[gPos];
                index = g[0]*32*32 + g[1]*32 + g[2];
                chunk[index] = g[3] || 1;
            }
        }
    });
}

AbstractObjects.prototype.buildGenerator = function(context){
    var ob = this;
    var transformedObjects = this.objects.map(function(o){
        return ob.build(o, context);
    }).map(function(object){
        var min = {};
        var max = {};
        object.forEach(function(coords){
            if((!min.x) || min.x > coords[0]) min.x = coords[0];
            if((!min.y) || min.y > coords[1]) min.y = coords[1];
            if((!min.z) || min.z > coords[2]) min.z = coords[2];
            if((!max.x) || max.x < coords[0]) max.x = coords[0];
            if((!max.y) || max.y < coords[1]) max.y = coords[1];
            if((!max.z) || max.z < coords[2]) max.z = coords[2];
        })
        return {
            geometry : object,
            bounds : {min:min, max:max}
        }
    });
    this.getOptions(context, function(options){
        result = function(x, y, z, value){
            if(value) return value;
            var b, g;
            for(var lcv=0; lcv< transformedObjects.length; lcv++){
                g = transformedObjects[lcv].geometry;
                b = transformedObjects[lcv].bounds;
                //console.log('!', g.length, b)
                if(
                    x >= b.min.x &&
                    x <= b.max.x &&
                    y >= b.min.y &&
                    y <= b.max.y &&
                    z >= b.min.z &&
                    z <= b.max.z
                ){
                    var matching = g.filter(function(coord){
                        return x == coord[0] && y == coord[1] && z == coord[2];
                    });
                    if(matching[0]) return matching[0][3] || 1;
                }
            }
            return value || 0;
        }
    });
    return result;
}
Objects = AbstractObjects;
//Objects.Trees = require('./objects/trees');



module.exports = Objects;
