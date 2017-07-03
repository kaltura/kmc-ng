# Develop kmc-ng solution
As described in the [readme.md / kmc-ng solution](../README.md#kmc-ng-solution) KMC-ng is built on-top of several Kaltura instrastructure packages.
 
## Kaltura-ng dev workspace tool
To be able to make changes across repositories we will use a tool (named **kaltura-ng-dev-workspace**) that will make the binding between them. The tool will do the following:
 - download all relevant repositories from github
 - run `yarn install` to setup all dependencies
 - create symlink between projects (meaning changes in one repo will be relflected automatically in all the dependent projects).
 - build everything in topological order (according to dependency graph).
 
 ## Getting started
 
1. Follow [kaltura-ng-dev-workspace getting started guide](https://github.com/kaltura/kaltura-ng-dev-workspace#getting-started) to setup your machine.
2. when asked to create file `kaltura-ws.json` use the following content instead of the one used in the guide:
```json
{
  "version" : "1.0.1",
  "repositories": [
    "https://github.com/kaltura/kaltura-ng.git",
    "https://github.com/kaltura/kaltura-ng-mc-theme.git",
    "https://github.com/kaltura/kmc-ng.git"
  ]
}
```
3. once the setup complete open the `kmc-ng` repo and try to serve it:
 ```bash
$ cd kmc-ng
$ yarn start
```

You should be able to open kmc-ng application in your browser at `http://localhost:4200`.