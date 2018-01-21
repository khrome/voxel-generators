voxel-generators
================

Deterministic Random Numbers
----------------------------
- **.Random.seed([seed])** : returns a new deterministic generator based on the provided seed.

Noise Generators
---------------
- **.Noise.perlin()** : returns a factory that can create new noise by seed according to the [perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) algorithm.

- **.Noise.simplex()** : returns a factory that can create new noise by seed according to the [perlin noise](https://en.wikipedia.org/wiki/Simplex_noise) algorithm.

Noise Factories
---------------
Noise factories take 2D Noise algorithms and tile them across the map in a deterministic way

- **.SeamlessNoiseFactory(seed, NoiseClass, lower, upper, mapFn)** : Generates 5 textures per chunk and blends them to create seamless edges and extrudes that in the provided range
- **.TiledNoiseFactory(seed, NoiseClass, lower, upper, mapFn)** : Generates 1 texture per chunk and extrudes that in the provided range

More docs to come

Testing
-------
Eventually it'll be:

    mocha

Enjoy,

 -Abbey Hawk Sparrow
