# KMCng Application

> Kaltura Management Consol HTML5 based application (a.k.a KMCng). Should replace the existing [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).
  
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
> This project is developed along-side the [kaltura-ng](https://github.com/kaltura/kaltura-ng) packages and [mc-theme](https://github.com/kaltura/kaltura-ng-mc-theme) package. To simplify local development we created a tool that automagically bind them together as-if they where part of the same repository.

You have two development options as described below.

#### Develop kmc-ng solution (multiple repos)
> In this option you will clone all the relevant repos to your machine and bind them together. Use this option to develop and create pull requests.

Please read [docs/develop kmc-ng solution guide](./docs/develop-kmc-ng-solution.md).

#### Develop kmc-ng repo
> In this option you will work with kmc-ng repo sources only. Use this option if you want to play with workable version and not intend to create any pull reqeusts.

```bash
# clone our repo
$ git clone https://github.com/kaltura/kmc-ng.git 

# change directory to your app
$ cd kmc-ng

# checkout latest version
$ git tag #will print you all the availble tags
$ git checkout -b {latest_tag_version} # replace {latest_tag_version} with actual tag value

# install the dependencies with npm
$ yarn

# run a local server
$ yarn start
```


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
|  [kaltura-client](https://www.npmjs.com/package/@kaltura-ng/kaltura-client) | ![npm (scoped)](https://img.shields.io/npm/v/@kaltura-ng/kaltura-client.svg?maxAge=86400) |
| [kaltura-common](https://www.npmjs.com/package/@kaltura-ng/kaltura-common) | ![npm (scoped)](https://img.shields.io/npm/v/@kaltura-ng/kaltura-common.svg?maxAge=86400) |
| [kaltura-ui](https://www.npmjs.com/package/@kaltura-ng/kaltura-ui) | ![npm (scoped)](https://img.shields.io/npm/v/@kaltura-ng/kaltura-ui.svg?maxAge=86400) |
| [kaltura-primeng-ui](https://www.npmjs.com/package/@kaltura-ng/kaltura-primeng-ui) | ![npm (scoped)](https://img.shields.io/npm/v/@kaltura-ng/kaltura-primeng-ui.svg?maxAge=86400) |
| [kaltura-typescript-client](https://www.npmjs.com/package/kaltura-typescript-client) | ![npm (scoped)](https://img.shields.io/npm/v/kaltura-typescript-client.svg?maxAge=86400) |
| [@kaltura-ng/mc-theme](https://www.npmjs.com/package/@kaltura-ng/mc-theme) | ![npm (scoped)](https://img.shields.io/npm/v/@kaltura-ng/mc-theme.svg?maxAge=86400)
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
