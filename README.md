# KMCng Application

[![Gitter chat](https://badges.gitter.im/kaltura-ng/kmc-ng.png)](https://gitter.im/kaltura-ng/kmc-ng)


> Kaltura Management Console HTML5 based application (a.k.a KMCng). Should replace the existing [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).
  
KMCng application uses the following technologies and conventions:
* [Angular CLI](https://cli.angular.io/) to manage the application (dev)ops.
* [TypeScript](http://www.typescriptlang.org/) language (superset of Javascript).
* Stylesheets with [SASS](http://sass-lang.com/) (not required, it supports regular css too).
* Error reported with [TSLint](http://palantir.github.io/tslint/) and [Codelyzer](https://github.com/mgechev/codelyzer).
* Best practices in file and application organization for [Angular 2]({https://angular.io/).

## Quick start

### Prerequisites

- [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above. 
- [x] Ensure you have [git installed](https://git-for-windows.github.io/) 
- [x] Ensure you have npm installed, version 5.0.0 or above.

### Project build options
> KKC-ng solution is comprised of many packages; The KMC-ng application is developed along-side the [kaltura-ng](https://github.com/kaltura/kaltura-ng) packages and [mc-theme](https://github.com/kaltura/kaltura-ng-mc-theme) package. To simplify local development we created a tool that automagically bind them together as-if they where part of the same repository.

You have two development options as described below.

#### Option I (the blue pill) - Build this repo (kmc-ng) only to get a running application
This option builds the kmc-ng repo against the Kaltura libraries published on NPM. 
Note that the build script runs an earlier version of the application which compiles against the published NPM libraries. This version does not include latest features and fixes.
  
  > Please do not open issues when using this version as it is not up to date.
  > If you want to create a pull request or open an issue, use the second option.

```bash
# clone our repo
$ git clone https://github.com/kaltura/kmc-ng.git 

# change directory to your app
$ cd kmc-ng

# install the dependencies
$ npm install

# checkout latest standalone code
$ npm run checkout-standalone

# sync dependencies to the new branch
$ npm install

# run a local server
$ npm start
```

> Note - if you need to [edit the application configuration](#config), change the environment.ts file only after running all of the commands above 

#### Option II (the red pill)- Develop kmc-ng complete solution (multiple repos)
> In this option you will clone all the relevant repos to your machine and bind them together. Use this option to develop and create pull requests.

Please read [docs/develop kmc-ng solution guide](./docs/develop-kmc-ng-solution.md).


### Run the application
Run the following command
```
$ npm start
```
navigate to [http://localhost:4200](http://localhost:4200) in your browser.

## <a name="config"></a>Configuring the application endpoints
The Github version configures server endpoints against the Kaltura production server.
If you need to configure these enpoint, edit the [environment.ts](https://github.com/kaltura/kmc-ng/blob/33c3f177bf4437092b4ba46d3f9e9a470463a481/src/environments/environment.ts#L15-L24) file.

## Deploy standalone application

To create a standalone application you will need to build the application:
```
$ ng build --prod
```

A distrubted standalone application will be created in the `dist/` folder.

Update the base url to match your production environment.
- Open the `index.html` file in the dist folder.
- update the following `<base href="/">` to match the relative path this application will be hosted at. Make sure you use `/` as a suffix of the href value.


## KMC-ng solution
KMC-ng is built on-top of several kaltura instrastructure packages. 
Below is a summary of the core packages being used:

 Package | Version  |
|:-------|:-------|
|  [kaltura-client](https://www.npmjs.com/package/@kaltura-ng/kaltura-client) | [![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-client.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-client) |
| [kaltura-common](https://www.npmjs.com/package/@kaltura-ng/kaltura-common) | [![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-common.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-common) |
| [kaltura-ui](https://www.npmjs.com/package/@kaltura-ng/kaltura-ui) | [![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-ui.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-ui) |
| [kaltura-primeng-ui](https://www.npmjs.com/package/@kaltura-ng/kaltura-primeng-ui) |[![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-primeng-ui.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-primeng-ui) |
| [kaltura-typescript-client](https://www.npmjs.com/package/kaltura-typescript-client) | [![npm version](https://badge.fury.io/js/kaltura-typescript-client.svg)](https://badge.fury.io/js/kaltura-typescript-client) |
| [@kaltura-ng/mc-theme](https://www.npmjs.com/package/@kaltura-ng/mc-theme) | [![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fmc-theme.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fmc-theme)
**Note**

- The version number listed above represent the latest version deployed to npm for each package. This is not necessarily the versions currently in-use by this app. You can review `package.json` to get the actual packages versions.

## FAQ

#### Where can I create a kaltura account to access the application?
If you already have a Kaltura account you can use its' credentials to login to the kmc-ng application.
 
> Note that any changes to the data will affect your production account. Keep in mind that we are currently under heavy development.
 
 If you don't have an account yet, you can [sign-up to a free trial](https://corp.kaltura.com/free-trial).


## License and Copyright Information
All code in this project is released under the [AGPLv3 license](http://www.gnu.org/licenses/agpl-3.0.html) unless a different license for a particular library is specified in the applicable library path.

Copyright © Kaltura Inc. All rights reserved.
