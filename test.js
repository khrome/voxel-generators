(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['mocha', 'should', './objects/trees', './objects/houses', './voxel-random'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('mocha'),
            require('should'),
            require('./objects/trees'),
            require('./objects/houses'),
            require('./voxel-random')
        );
    } else {
        throw new Error('global testing not supported!');
    }
}(this, function (mocha, should, Trees, Houses, Random){
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

            it('objects/trees is symetrical', function(){
                var generatorChunk = (new Array(32*32*32))
                var writtenChunk = (new Array(32*32*32))
                for(var lcv=0; lcv<generatorChunk.length; lcv++){
                    generatorChunk[lcv] = 0;
                    writtenChunk[lcv] = 0;
                }
                for(var lcv=0; lcv<generatorChunk.length; lcv++){
                    should.equal(writtenChunk[lcv], generatorChunk[lcv]);
                    should.exist(writtenChunk[lcv]);
                    should.exist(generatorChunk[lcv]);
                }
                trees.writeInto(
                    {random : Random.seed('test')}, //context
                    writtenChunk
                );
                var gen = trees.buildGenerator({random : Random.seed('test')});
                var index;
                for(var x=0; x< 32; x++){
                    for(var y=0; y< 32; y++){
                        for(var z=0; z< 32; z++){
                            index = x*32*32 + y*32 + z
                            generatorChunk[index] = gen(x, y, z, generatorChunk[index]);
                        }
                    }
                }
                for(var lcv=0; lcv<generatorChunk.length; lcv++){
                    should.equal(
                        writtenChunk[lcv],
                        generatorChunk[lcv],
                        'Expect chunks to be equal at position '+
                            lcv+', but found '+writtenChunk[lcv]+
                            ' and '+generatorChunk[lcv]
                    );
                    should.exist(writtenChunk[lcv]);
                    should.exist(generatorChunk[lcv]);
                }
            });
        });
    });
}));
