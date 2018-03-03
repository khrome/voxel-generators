voxel-generators
================

Deterministic Random Numbers
----------------------------
- **.Random.seed([seed])** : returns a new deterministic generator based on the provided seed.

Noise Generators
----------------
- **.Noise.perlin()** : returns a factory that can create new noise by seed according to the [perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) algorithm.
- **.Noise.simplex()** : returns a factory that can create new noise by seed according to the [simplex noise](https://en.wikipedia.org/wiki/Simplex_noise) algorithm.

Noise Factories
---------------
Noise factories take 2D Noise algorithms and tile them across the map in a deterministic way

- **.SeamlessNoiseFactory(seed, NoiseClass, lower, upper, mapFn)** : Generates 5 textures per chunk and blends them to create seamless edges(**within** a single biome) and extrudes that in the provided range
- **.TiledNoiseFactory(seed, NoiseClass, lower, upper, mapFn)** : Generates 1 texture per chunk and extrudes that in the provided range

Object Generators
-----------------
- **voxel-generators/objects/trees** : returns an object that allows you to add a tree `trees.add({x:<x>, y:<y>, z:<z>, height:<max height>, material:<material index>})`, then can be passed into a geometry reducer.
- **voxel-generators/objects/houses** : returns an object that allows you to add a house `houses.add({x:<x>, y:<y>, z:<z>, size:<cube size>, material:<material index>})`, then can be passed into a geometry reducer.

More docs to come

Testing
-------

    mocha

Enjoy,

 -Abbey Hawk Sparrow
