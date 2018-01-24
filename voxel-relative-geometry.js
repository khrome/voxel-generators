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
