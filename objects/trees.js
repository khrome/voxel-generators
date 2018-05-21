var Geometry = require('../voxel-relative-geometry');
var Objects = require('../voxel-objects');

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
                    return [config.x+coords[0], config.y+coords[1]+lcv, config.z+coords[2], config.leaves || 4]
                }).concat(coords);
            }
            if(lcv === top-1) coords.push([config.x, config.y+lcv, config.z, config.leaves || 4])
            else coords.push([config.x, config.y+lcv, config.z, config.trunk || 3])
        }
        //process.exit();
        return coords;
    },
    createOptions : function(context, callback){
        callback(undefined, {});
    }
});
