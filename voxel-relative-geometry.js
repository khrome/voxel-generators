var combinations2D = function(arr){ //omits 0, 0
    var a;
    var b;
    var results = [];
    var len = arr.length;
    for(a=0; a < len; a++){
        for(b=0; b < len; b++){
            if(! (
                a === 0 && b === 0
            )) results.push([arr[a], arr[b]]);
        }
    }
    return results;
}

var combinations3D = function(arrA, arrB, arrC){
    if(arrA && arrB && !arrC){
        arrC = [0];
    }
    if(arrA && (!arrB) && (!arrC)){
        arrB = arrC = arrA;
    }
    var a;
    var b;
    var c;
    var results = [];
    for(a=0; a < arrA.length; a++){
        for(b=0; b < arrB.length; b++){
            for(c=0; c < arrC.length; c++){
                results.push([arrA[a], arrB[b], arrC[c]]);
            }
        }
    }
    return results;
}

var allSquareDistances = function(maxDistance){
    var distances = [];
    distances.push(0);
    for(var lcv =1; lcv <= maxDistance; lcv++){
        distances.push(lcv);
        distances.push(-1 * lcv);
    }
    return distances;
}
var edgeSquareDistances = function(maxDistance){
    var distances = [];
    distances.push(0);
    for(var lcv =1; lcv <= maxDistance; lcv++){
        distances.push(lcv);
        distances.push(-1 * lcv);
    }
    distances = distances.filter(function(item){
        Math.abs(item[0]) === maxDistance || Math.abs(item[0]) === maxDistance
    })
    return distances;
}

var relativeToOccurances2D = function(x, z, geometry, locations, tileSize, cb){
    var pos;
    var lcv;
    var test;
    var xx;
    var zz;
    //todo: some wierdness if objects are too close
    //eventually multi-select or limit closeness
    var len = geometry.length;
    for(lcv =0; lcv < len; lcv++){
        xx = x+geometry[lcv][0];
        zz = z+geometry[lcv][1];
        if(
            xx >= tileSize ||
            zz >= tileSize ||
            xx < 0 ||
            zz < 0
        ) continue;
        test = locations[xx + zz * tileSize] || 0;
        if(test){
            if(cb) cb(xx,zz);
            return test;
        }
    }
}

var distanceCache = {};

var RelativeGeometry = {};
RelativeGeometry.intersection = function(shape1, shape2){
    var copy = shape.slice(0);
    shape2.forEach(function(coord){
        if(shape1.indexOf(coord) === -1) copy.push(coord)
    })
};
RelativeGeometry.cube = function(size, hollow){ //odd cube
    var newSize = Math.floor(size/2);
    var all = combinations3D(allSquareDistances(newSize));
    if(hollow) all = all.filter(function(coords){
        var xFactor = Math.abs(coords[0]) === newSize;
        var yFactor = Math.abs(coords[1]) === newSize;
        var zFactor = Math.abs(coords[2]) === newSize;
        var result = xFactor || yFactor || zFactor;
        return result;
    });
    return all;
};

RelativeGeometry.box = function(sizeX, sizeY, sizeZ, hollow){
    var all = combinations3D(
        allSquareDistances(sizeX),
        allSquareDistances(sizeY),
        allSquareDistances(sizeZ)
    );
    if(hollow) return all.filter(function(coords){
        return
            Math.abs(coords[0]) === sizeX ||
            Math.abs(coords[1]) === sizeY ||
            Math.abs(coords[2]) === sizeZ ;
    });
    return all;
};

RelativeGeometry.sphere = function(radius, hollow){
    var diameter = 2 * radius;
    var coords = [];
    for(var x; x < diameter; x++){
        for(var y; y < diameter; y++){
            for(var z; z < diameter; z++){
                if(x*x+y*y+z*z <= radius*radius){
                    if(hollow){
                        if(x*x+y*y+z*z > (radius-1)*(radius-1)){
                            coords.push([x, y, z]);
                        }
                    }else coords.push([x, y, z]);
                }
            }
        }
    }
    return x*x+y*y+z*z <= 15*15 ? 1 : 0
};

RelativeGeometry.ellipse = function(radius, relativeFocus, hollow){

};

var locationOfShapeContainingGenerator = function(relativeShape, locations, tileSize){
    return function(x, z, cb){
        return relativeToOccurances2D(
            x, z,
            relativeShape,
            locations,
            tileSize || 32,
            cb
        );
    };
}
var ocurranceOfSquareContainingGenerator = function(occurances, distance, isHollow, tileSize){
    var dimension = tileSize || 32;
    var relativeDistances = distanceCache[distance]?
        distanceCache[distance]:
        (distanceCache[distance] = combinations2D(
            isHollow?
            edgeSquareDistances(distance):
            allSquareDistances(distance)
        ));
    var occuranceRelativeTo = locationOfShapeContainingGenerator(
        relativeDistances,
        occurances,
        isHollow,
        tileSize
    );
    return function(x, y, z, coordinatesCallback){
        return occuranceRelativeTo(x, z, coordinatesCallback);
    }
}

RelativeGeometry.ocurranceOfSquareContainingGenerator =
    ocurranceOfSquareContainingGenerator;

module.exports = RelativeGeometry;
