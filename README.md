# KMC-ng Application

> Kaltura management console HTML5 based applciation (a.k.a KMC-ng).
  
KMC-ng application uses the following technologies: 
* Best practices in file and application organization for [Angular 2](https://angular.io/).
* Ready to go build system using [Webpack](https://webpack.github.io/docs/) for working with [TypeScript](http://www.typescriptlang.org/).
* Testing Angular 2 code with [Jasmine](http://jasmine.github.io/) and [Karma](http://karma-runner.github.io/).
* Coverage with [Istanbul](https://github.com/gotwarlost/istanbul)
* End-to-end Angular 2 code using [Protractor](https://angular.github.io/protractor/).
* Stylesheets with [SASS](http://sass-lang.com/) (not required, it supports regular css too).
* Error reported with [TSLint](http://palantir.github.io/tslint/) and [Codelyzer](https://github.com/mgechev/codelyzer).
* Documentation with [TypeDoc](http://typedoc.io/).



## Quick start

### Prerequisites

Make sure you have the following libraries installed globally.
```bash
$ sudo npm i -g webpack typings webpack-cli
```


Clone the repository and load project dependencies

```bash
# clone our repo
$ git clone https://github.com/kaltura/KMCng.git kmc-ng

# change directory to your app
$ cd kmc-ng

# install the dependencies with npm
$ npm install

# start the server
$ npm start
```
go to [http://localhost:8080](http://localhost:8080) in your browser.

# Table of Contents

* [Getting Started](#getting-started)
    * [Dependencies](#dependencies)
    * [Installing](#installing)
    * [Running the app](#running-the-app)
    * [Developing](#developing)
    * [Testing](#testing)
    * [Documentation](#documentation)
* [Frequently asked questions](#faq)
* [License](#license)

# Getting Started

## Prerequisites

Install [Node.js and npm](https://nodejs.org/en/download/) if they are not already on your machine

> Verify that you are running at least node v4.x.x and npm 3.x.x by running `node -v` and `npm -v` in a terminal/console window. 

## Installing

* `fork` this repo
* `clone` your fork
* `npm install` to install all dependencies

## Running the app

After you have installed all dependencies you can now run the app with:

```bash
npm start
```

It will start a local server using `webpack-dev-server` which will watch, build (in-memory), and reload for you. The port will be displayed to you as `http://localhost:8080`.

## Developing

### Build files

This section will be update soon.

## Testing

This section will be update soon.

## Documentation

This section will be update soon.

# Hosted applications
- KMC-ng was built as a 'shell' that host mini applications (a.k.a kmc-apps) based on context. 
- Developers can easily build kmc-app and register them into the KMC-ng shell and benefit its features and services such as user-context, permission concepts, i18n, caching, lazy loading etc.
- To provide flexible platform each kmc-app is self-sufficient and is not aware/dependent on others.
- KMC-app is however depend on the KMC-ng shell and thus should be hosted in the same sub-domain. 

We are using nginx during the developement process to simulate one sub-domain of multiple repositories.

## Setup nginx on your machine
To install nginx using homebrew read the following [article](http://learnaholic.me/2012/10/10/installing-nginx-in-mac-os-x-mountain-lion/).

Update nginx configuration file (usually at ```/usr/local/etc/nginx/nginx.conf```) with the following server:

```bash
 server {
    listen       1234;
    server_name  localhost;

    # access_log  /var/log/nginx_access.log;

    # This is the default location that exposes the KMC-ng application served at 8080
    location /{
        proxy_pass   http://localhost:8080;
    }
 }
```

## Setup new KMC-App on your machine
1. Clone the KMC-App you want to develop

Update nginx configuration file:
* add the following inside the server node we created in previous step.
* Append it **above** the default location.

```bash
    location /{the relative url of that application}/ {
        alias {the path to the kmc-app repository code/dist folder};
    }
```

For example, for the player-studio kmc-app the configuration should resemble the following:
```bash
    location /player-studio/ {
        alias /Users/eransakal/dev/github/kaltura/player-studio/player-studio/app/;
    }
```

> You will need to signal nginx to refresh nginx by running ```sudo nginx -s reload```

# FAQ

#### Do I need to add script / link tags into index.html ?

No, Webpack will add all the needed Javascript bundles as script tags and all the CSS files as link tags. The advantage is that you don't need to modify the index.html every time you build your solution to update the hashes.

#### How to include external angular 2 libraries ?

It's simple, just install the lib via npm and import it in your code when you need it. Don't forget that you need to configure some external libs in the `src/main` bootstrap] of your application.

### How to include external css files such as bootstrap.css ?

Just install the lib and import the css files in `src/vendor.ts`. For example this is how to do it with bootstrap:

```sh
npm install bootstrap@4.0.0 --save
```

And in `src/vendor.ts` add the following:

```ts
import 'bootstrap/dist/css/bootstrap.css';
```

# License

[AGPL3](/LICENSE)
