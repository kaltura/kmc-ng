# Develop kmc-ng solution
As described in the [readme.md / kmc-ng solution](../README.md#kmc-ng-solution) KMC-ng is built on-top of several Kaltura instrastructure packages.
 
## Kaltura-ng dev workspace tool
To be able to make changes across repositories we will use a tool (named **kaltura-ng-dev-workspace**) that will make the binding between them. The tool will do the following:
 - download all relevant repositories from github
 - run `npm install` to setup all dependencies
 - create symlink between projects (meaning changes in one repo will be relflected automatically in all the dependent projects).
 - build everything in topological order (according to dependency graph).
 
 ## Getting Started
 The following guide was copied from [kaltura-ng-dev-workspace getting started guide](https://github.com/kaltura/kaltura-ng-dev-workspace#getting-started).
 
 #### Prerequisites
 
 - [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above. 
 - [x] Ensure you have [git installed](https://git-for-windows.github.io/) 
 - [x] Ensure you have npm installed, version 5.0.0 or above.
 
 #### Setup your workspace
 1. create a folder to hold your packages (your workspace **root folder**). Note that **it is not** the kmc-ng repository folder.
 2. create `package.json` in your **root folder**  by running the following command:
 ```
  $ npm init -y
  ```
 3. add this tool to your folder in your root folder by running the following command:
 ```
 $ npm install @kaltura-ng/dev-workspace
 ```
 
 4. create file `kaltura-ws.json` in your root folder with the following format:
 
 ```json
 {
   "version" : "2.0.0",
   "repositories": [
     { "origin" : "github", "uri": "https://github.com/kaltura/kaltura-ng.git"},
     { "origin" : "github", "uri": "https://github.com/kaltura/kaltura-ng-mc-theme.git"},
     { "origin" : "github", "uri": "https://github.com/kaltura/kmc-ng.git"}
   ]
 }
 ```
   
 5. add the following to your `package.json`:
 ```json
   "scripts" : {
     "kws" : "kws",
     "setup" : "kws setup",
     "build" : "kws run build",
     "licenses" : "kws licenses --type=direct",
     "clean" : "kws clean"
   }
 ```
 
 6. run setup command to build & symlink your repositories (**Note** It might take a few minutes)
 ```bash
 $ npm run setup
 ```

7. once the setup complete open the `kmc-ng` repo and try to serve it:
 ```bash
$ cd kmc-ng
$ npm start
```

You should be able to open kmc-ng application in your browser at `http://localhost:4200`.
