# Base Node Repo

**Note: these notes assume you're on a unix-like OS, like macOS or Ubuntu**

This repo is an archive of a pared-down version of Nic's browser-based prototyping environment. It might be a useful reference to you if you want a node/npm to browser workflow. You're not obligated to use it for anything, but it's here if you want it.

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
