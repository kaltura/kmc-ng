# KMCng Application

> Kaltura management console HTML5 based application (a.k.a KMCng). should replace the existing [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).
  
KMCng application uses the following technologies:
* [Angular CLI](https://cli.angular.io/) to manage the application (dev)ops.
* Best practices in file and application organization for [Angular 2](https://angular.io/).
* [TypeScript](http://www.typescriptlang.org/) language (superset of Javascript).
* [Yarn](https://yarnpkg.com/en/) as our dependency management.
* Stylesheets with [SASS](http://sass-lang.com/) (not required, it supports regular css too).
* Error reported with [TSLint](http://palantir.github.io/tslint/) and [Codelyzer](https://github.com/mgechev/codelyzer).


# Quick start

### Prerequisites

- [x]  Ensure that you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above. 
- [x] Ensure that you have [git installed](https://git-for-windows.github.io/) 
- [x] Ensure that you have [yarn installed](https://yarnpkg.com/lang/en/docs/install/) (we use it for node package management) 

### Get the sources
Clone the repository and load project dependencies
```bash
# clone our repo
$ git clone https://github.com/kaltura/kmc-ng.git 

# change directory to your app
$ cd kmc-ng

# install the dependencies with npm
$ yarn
```


### Run the application
Run the following command
```
$ yarn start
```
navigate to [http://localhost:4200](http://localhost:4200) in your browser.
# FAQ

#### Where can I create a kaltura account to access the application?
If you already have a Kaltura account you can use its' credentials to login to the kmc-ng application.
 
> Note that any changes to the data will affect your production account you used while login. Keep in mind that we are currently under haveily development.
 
 If you don't have an account yet, you can [sign-up to a free trial](https://corp.kaltura.com/free-trial).


# License

[AGPL3](/LICENSE)
