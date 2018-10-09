(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'mocha',
            'should',
            './objects/trees',
            './objects/houses',
            './voxel-random',
            './voxel-generators',
            './voxel-geometry-reducer',
            './voxel-absolute-geometry',
            './voxel-relative-geometry'
        ], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('mocha'),
            require('should'),
            require('./objects/trees'),
            require('./objects/houses'),
            require('./voxel-random'),
            require('./voxel-generators'),
            require('./voxel-geometry-reducer'),
            require('./voxel-absolute-geometry'),
            require('./voxel-relative-geometry')
        );
    } else {
        throw new Error('global testing not supported!');
    }
}(this, function (mocha, should, Trees, Houses, Random, Generators, GeometryReducer, absolute, relative){
    var chunkShouldBeDiverse = function(chunk, range){
        var count=0;
        var seen = [];
        for(var lcv=0; lcv<chunk.length; lcv++){
            if(seen.indexOf(chunk[lcv])){
                count++;
                seen.push(chunk[lcv]);
            }
        }
        count.should.be.above(range,
            'expected more at least '+range+' materials, but only found '+count+
                '('+seen.join(', ')+')'
        );
    };

    var chunksShouldBeEqual = function(chunkA, chunkB, nameA, nameB){
        for(var lcv=0; lcv<chunkA.length; lcv++){
            should.equal(
                chunkA[lcv],
                chunkB[lcv],
                'Expect chunks to be equal at position '+
                    lcv+', but found '+chunkA[lcv]+
                    ' and '+chunkB[lcv]+"\n        "+
                    "["+nameA+"]:"+chunkA.slice(lcv-10, lcv+10)+"\n        "+
                    "["+nameB+"]:"+chunkB.slice(Math.ceil(lcv-10, 0), lcv+10)
            );
            should.exist(chunkA[lcv]);
            should.exist(chunkB[lcv]);
        }
    }

    describe('voxel-generators', function(){
        describe('voxel-objects', function(){

            var trees = new Trees();
            before(function(){
                fakeContext = {random : Random.seed('test')};
                trees.add({ x:5, y:0, z:5, height: 20 });
                trees.add({ x:5, y:0, z:10, height: 20 });
                trees.add({ x:10, y:0, z:5, height: 20 });
                trees.add({ x:10, y:0, z:10, height: 20 });
            });

            //*
            it('objects/trees is symetrical', function(){
                var writtenChunk = trees.writeInto(
                    {random : Random.seed('test')}, //context
                    new Int8Array(32*32*32)
                );
                var gen = trees.buildGenerator({random : Random.seed('test')});
                var generatorChunk = absolute.renderChunk(gen, 32);

                chunksShouldBeEqual(generatorChunk, writtenChunk, 'generated', 'written  ');
            }); //*/

            //*
            it('geometry-reducer renderers produce equivilent output', function(){
                var random = Random.seed('test')
                var lower = 8;
                var upper = 12;
                var trees = new Trees();
                var geometry = new GeometryReducer(
                    Generators.SeamlessNoiseFactory(
                        'aFakeSeed',
                        Generators.Noise.perlin(random),
                        lower, upper
                    )
                );
                for(var x=1; x < 30; x++){
                    for(var z=1; z < 30; z++){
                        if((random()*35) < 1) trees.add({
                            x:x,
                            y:0,
                            z:z,
                            height:26
                        });
                    }
                }
                geometry.add(trees);
                var buildGeneratorA = geometry.integrated({random:Random.seed('test')});
                var buildGeneratorB = geometry.calculated({random:Random.seed('test')});
                var a = buildGeneratorA();
                var b = GeometryReducer.generateSubmesh(buildGeneratorB());
                chunkShouldBeDiverse(a, 3);
                chunkShouldBeDiverse(b, 3);
                chunksShouldBeEqual(a, b, 'INTEGRATED', 'CALCULATED');
            });
            //*/
        });
    });
}));
