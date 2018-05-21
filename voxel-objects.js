var Objects;
var extend = require('extend');
var absolute = require('./voxel-absolute-geometry');
var relative = require('./voxel-relative-geometry');

var AbstractObjects = function(){
    this.objects = [];
};

AbstractObjects.implement = function(cls){
    var cons;
    var proto;
    if(typeof cls == 'function'){
        cons = cls;
        proto = cls.prototype;
    }else{
        cons = new Function();
        proto = cls;
    }
    var syntheticConstructor = function(){
        cons.apply(this, arguments);
        AbstractObjects.apply(this, arguments);
    }
    var clone = extend({}, AbstractObjects.prototype);
    syntheticConstructor.prototype = clone;
    syntheticConstructor.constructor = syntheticConstructor;
    Object.keys(proto).forEach(function(key){
        syntheticConstructor.prototype[key] = proto[key];
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

AbstractObjects.prototype.writeInto = function(context, chunk){
    var ob = this;
    var objs = this.objects.map(function(o){ return ob.build(o, context); });
    return absolute.writeIntoChunk(objs, chunk);
}

AbstractObjects.prototype.buildGenerator = function(context){
    var ob = this;
    var objs = this.objects.map(function(o){ return ob.build(o, context); });
    this.getOptions(context, function(options){
        result = function(x, y, z, value){
            if(value) return value;
            var b, g;
            for(var lcv=0; lcv< objs.length; lcv++){
                g = objs[lcv];
                var matching = g.filter(function(coord){
                    return (x == coord[0] && y == coord[1] && z == coord[2]);
                });
                if(matching[0]) return matching[0][3] || 1;
                if(matching.length) console.log('FOUND', matching[0])
            }
            return value || 0;
        }
    });
    return result;
}
Objects = AbstractObjects;
//Objects.Trees = require('./objects/trees');



module.exports = Objects;
