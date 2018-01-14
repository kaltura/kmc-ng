# KMCng Application
![Current phase](https://img.shields.io/badge/Current_Phase-Heavy_Development-red.svg)
[![Gitter chat](https://badges.gitter.im/kaltura-ng/kmc-ng.png)](https://gitter.im/kaltura-ng/kmc-ng)


> Kaltura Management Console HTML5 based application (a.k.a KMCng). Should replace the existing [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).

Thank you for your interest in the kmc-ng project. The project is currently under **Heavy Development**. Every month we add many features and bug fixes, part of them break previous versions code.

In the coming months we plan to complete adding all the features we have in the legacy kmc as well as some new shiny features.

The following list contains some major features in our roadmap:
- [ ] upgrade to Angular 5
- [ ] add on-prem server configuration provided at run-time
- [ ] embed permission support across views
- [ ] add multi language translations
- [ ] add missing views (like settings > custom data, content > syndication etc)
- [ ] add missing tools like thumbnail grab from video
- [ ] add external app integration (like studio, analytics, usage dashboard, entry Clip&Trim etc)



## Quick start

### Prerequisites

- [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above. 
- [x] Ensure you have [git installed](https://git-for-windows.github.io/) 
- [x] Ensure you have npm installed, version 5.0.0 or above.

### Project build options
> KKC-ng solution is comprised of many packages; The KMC-ng application is developed along-side the [kaltura-ng](https://github.com/kaltura/kaltura-ng) packages. To simplify local development we created a tool that automagically bind them together as-if they where part of the same repository.

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
$ npm run standalone

# sync dependencies to the new branch
$ npm install

```

> Note - if you need to [edit the application configuration](#config), change file [src/app-config/index.ts](https://github.com/kaltura/kmc-ng/blob/master/src/app-config/index.ts#L13)

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
If you need to configure these enpoint, edit file [src/app-config/index.ts](https://github.com/kaltura/kmc-ng/blob/master/src/app-config/index.ts#L13).

## Deploy standalone application

To create a standalone application you will need to build the application:
```
$ ng build:prod
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
| [kaltura-common](https://www.npmjs.com/package/@kaltura-ng/kaltura-common) | [![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-common.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-common) |
| [kaltura-ui](https://www.npmjs.com/package/@kaltura-ng/kaltura-ui) | [![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-ui.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-ui) |
| [kaltura-primeng-ui](https://www.npmjs.com/package/@kaltura-ng/kaltura-primeng-ui) |[![npm version](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-primeng-ui.svg)](https://badge.fury.io/js/%40kaltura-ng%2Fkaltura-primeng-ui) |
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
