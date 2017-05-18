# Building and Testing KMC[ng] infrastructure

This document describes how to set up your development environment to build and test KMC[ng] infrastructure libraries.

It also explains the basic mechanics of using `git`, `node`, and `npm`.

* [Prerequisite Software](#prerequisite-software)
* [Getting the Sources](#getting-the-sources)
* [Installing NPM Modules](#installing-npm-modules)
* [Building](#building)
* [Running Tests Locally](#running-tests-locally)
* [Debugging locally](#debugging)
* [Formatting your source code](#code-format)
* [Explore developer guides and samples](#developer-guides)

See the [contribution guidelines](CONTRIBUTING.md)
if you'd like to contribute to our solution.

## Prerequisite Software

Before you can build and test, you must install and configure the
following on your development machine:

* [Git](http://git-scm.com) and/or the **GitHub app** (for [Mac](http://mac.github.com) or
  [Windows](http://windows.github.com)); [GitHub's Guide to Installing
  Git](https://help.github.com/articles/set-up-git) is a good source of information.

* [Node.js](http://nodejs.org), which is used to run a development web server,
  run tests, and generate distributable files. 
  
* [Yarn](https://yarnpkg.com/en/) is used to as Node's Package Manager. It replaces `npm` and must be installed to be able to run our scripts. Note that we are still using npm to run scripts in our modules, we just stopped using it to add/install dependencies.

* [Watchman](https://facebook.github.io/watchman/) is used to allow developing locally multiple modules at the same time by syncing dependent module `dist` folder with the relevant `node_modules` library folder. 


## Getting the sources

Fork and clone the this repository:

1. Login to your GitHub account or create one by following the instructions given
   [here](https://github.com/signup/free).
2. [Fork](http://help.github.com/forking) the [repository](https://github.com/KMCng/KMCng-infra).
3. Clone your fork of the infrastructure repository and define an `upstream` remote pointing back to
   the Angular repository that you forked in the first place.

```shell
# Clone your GitHub repository:
git clone https://github.com/kaltura/kmcng.git

# Go to the Angular directory:
cd kmcng

# Add the main Angular repository as an upstream remote to your repository:
git remote add upstream https://github.com/kaltura/kmcng.git
```

## Installing dependencies 


Next, install the JavaScript modules needed.

```shell
# Run the following command from the repo root folder
$ npm run setup
```

* This command will do the following:
    * remove previous `node_modules` and `dist` folders
    * run `yarn install` (which is equivalent to `npm install`) 
    * run `npm run build` 
    * configure `wml` with to local modules of [kaltura-ng](https://github.com/kaltura/KMCng-infra) if exists on your machine.
  
    
> You should run setup every time you pull changes to make sure you are in-sync with latest libraries/changes done by others.
    
## Building

To build your sources do the following: 

```shell
$ npm run build
```
* Results are put in the `dist` folder of each module.

## Running Development server

To run a local server for development purposes do the following: 

```shell
$ npm run serve
```


## Syncing changes from other local module into an other module

If you are developing [kaltura-ng](https://github.com/kaltura/KMCng-infra) modules locally, and you want to sync their change into this repo do the following:

```shell
$ npm run wml:sync 
```

To watch for changes and sync them automatically when the local [kaltura-ng](https://github.com/kaltura/KMCng-infra) modules are being re-build do the following:
```shell
$ npm run wml:watch
```

## Running Tests Locally

To run tests once:
```shell
# in the *module* folder
$ npm run test
```

## <a name="code-format"></a>Formatting your source code

> This section is currently unavailable and will be completed soon. In the meanwhile use  [Angular2 Style Guide](https://angular.io/styleguide)

## <a name="developer-guides"></a>Explore developer guides and samples
Please review the developer guides section in [this article](docs/developers/developer-guide.md).