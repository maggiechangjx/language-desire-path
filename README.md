
**Note: these notes assume you're on a unix-like OS, like macOS or Ubuntu**

# Overview
A web-based project about how we individually and communally connect words.

# ES Build Specifics

## Organization

All of the source javascript and css should be in the `src` directory. This is the directory that the watch process watches. Compiled bundles (`bundle.css`, `bundle.js`) and source maps get written to the `pub` directory, which also contains the `index.html` file. `bundle.*` files are not version controlled. Finally, build scripts, asset compilers, and general development / deploy scripts live in the `bld` directory. That's it. Outside of that, have whatever folder structure makes sense to you.

## Install your dependencies

Once you've cloned this, you need to install dependencies. Run:

```sh
npm install
```

To download and install everything in the `package.json` manifest. The script should also generate a lock file, which should be `gitignore`d by default.

## Build your bundles

Once dependencies are installed, you should be able to run the development environment with:

```sh
npm run watch
```

This will start a dev server and a watch process that will monitor the `src` directory for changes, and recompile. `esbuild`, the module bundler, is orders of magnitude faster than `webpack`, so don't worry too much about asset compilation performance, unless it explicitly becomes an issue.

# Firebase Datastructure

The data in firebase are stored in structures like this: 

all-words
   word 
      word: 'word',
      x: #,
      y: #,
      click: #,
      red: #,
      green: #,
      blue: #,
      alpha: #

lines
   random key 
      word1: 'word',
      word2: 'word',
      x1: #,   (x coordinate around first word clicked)
      x2: #,   (y coordinate around first word clicked)
      ctr1x: #,
      ctrl1y: #,
      ctrl2x: #,
      ctrl2y: #,
      x2: #,   (x coordinate around second word clicked)
      y2: #    (y coordinate around second word clicked)

sentences 
   postID
      userID
         word1: 'word',
         word2: 'word',
         word3: 'word',
         word4: 'word',
         word5: 'word'