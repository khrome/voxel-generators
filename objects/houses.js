var Geometry = require('../voxel-relative-geometry');
var Objects = require('../voxel-objects');

module.exports = Objects.implement({
    build : function(config, context){
        if(!(
            config.x !== undefined &&
            config.y !== undefined &&
            config.z !== undefined
        )){
            console.log(config);
            throw new Error('houses require x, y, z');
        }
        var result = Geometry.cube(4, true).map(function(coords){
            return [config.x+coords[0], config.y+coords[1]+2, config.z+coords[2], config.material|| 1]
        });
        return result;
    },
    createOptions : function(context, callback){
        callback(undefined, {});
    }
});
