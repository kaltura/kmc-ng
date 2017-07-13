# KMCng Application

[![Gitter chat](https://badges.gitter.im/kaltura-ng/kmc-ng.png)](https://gitter.im/kaltura-ng/kmc-ng)


> Kaltura Management Console HTML5 based application (a.k.a KMCng). Should replace the existing [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).
  
KMCng application uses the following technologies and conventions:
* [Angular CLI](https://cli.angular.io/) to manage the application (dev)ops.
* [TypeScript](http://www.typescriptlang.org/) language (superset of Javascript).
* [Yarn](https://yarnpkg.com/en/) as our dependency management.
* Stylesheets with [SASS](http://sass-lang.com/) (not required, it supports regular css too).
* Error reported with [TSLint](http://palantir.github.io/tslint/) and [Codelyzer](https://github.com/mgechev/codelyzer).
* Best practices in file and application organization for [Angular 2]({https://angular.io/).

## Quick start

### Prerequisites

- [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above. 
- [x] Ensure you have [git installed](https://git-for-windows.github.io/) 
- [x] Ensure you have [yarn installed](https://yarnpkg.com/lang/en/docs/install/) (we use it for node package management) 

### Get the sources
> KKC-ng solution is comprised of many packages; The KMC-ng application is developed along-side the [kaltura-ng](https://github.com/kaltura/kaltura-ng) packages and [mc-theme](https://github.com/kaltura/kaltura-ng-mc-theme) package. To simplify local development we created a tool that automagically bind them together as-if they where part of the same repository.

You have two development options as described below.

#### Option I (the blue pill) - Develop kmc-ng application
Use this option if you want to get this app running fast and you don't care working with a code few days older.
  
  > If you want to later create a pull request you should use the second option.

```bash
# clone our repo
$ git clone https://github.com/kaltura/kmc-ng.git 

# change directory to your app
$ cd kmc-ng

# install the dependencies
$ yarn

# checkout latest standalone code
$ yarn run checkout-standalone

# sync dependencies to the new branch
$ yarn

# run a local server
$ yarn start
```

#### Option II (the red pill)- Develop kmc-ng complete solution (multiple repos)
> In this option you will clone all the relevant repos to your machine and bind them together. Use this option to develop and create pull requests.

Please read [docs/develop kmc-ng solution guide](./docs/develop-kmc-ng-solution.md).


### Run the application
Run the following command
```
$ yarn start
```
navigate to [http://localhost:4200](http://localhost:4200) in your browser.

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
