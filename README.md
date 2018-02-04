# KMCng Application
![Current phase](https://img.shields.io/badge/Current_Phase-Heavy_Development-red.svg)
[![Gitter chat](https://badges.gitter.im/kaltura-ng/kmc-ng.png)](https://gitter.im/kaltura-ng/kmc-ng)


> Kaltura Management Console HTML5 based application (a.k.a KMCng). Should replace the existing [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).

Thank you for your interest in the kmc-ng project. The project is currently under **Heavy Development**. Every month we add many features and bug fixes, part of them break previous versions code.

In the coming months we plan to complete adding all the features we have in the legacy kmc as well as some new shiny features.

The following list contains some major features in our road-map:
- [ ] upgrade to Angular 5
- [x] add runtime server configuration
- [ ] embed permission support across views
- [ ] add multi language translations
- [ ] add missing views (like settings > custom data, content > syndication etc)
- [ ] add missing tools like thumbnail grab from video
- [ ] add external app integration (like studio, analytics, usage dashboard, entry Clip&Trim etc)


## <a name="issue"></a> Got a question or found an Issue?
If you find a bug in the source code, you can help us by
[submitting an issue](https://github.com/kaltura/kmc-ng/issues).

## Getting started

### Prerequisites

- [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above. 
- [x] Ensure you have [git installed](https://git-for-windows.github.io/) 
- [x] Ensure you have npm installed, version 5.0.0 or above.

### Run the application
To run KMC-ng application, do the following:

```bash
# clone our repo
git clone https://github.com/kaltura/kmc-ng.git

# change directory to your app
cd kmc-ng

# checkout latest standalone code
npm run standalone

# sync dependencies to the new branch
npm install

# create runtime configuration file by coping a sample one (the code below is written for bash)
cp src/app/kmc-config.template.json src/app/kmc-config.json
vim src/app/kmc-config.json

# run the application in the browser (port 4200)
npm run start -- --o
```

### <a name="config"></a>Updating application configuration
By default the `kmc-config.template.json` file contains information that is used against Kaltura production server. We advice you to check that the application works as expected with the default configuration before you customize it against your own server.

### Contributing
KKC-ng solution is comprised of many packages; The KMC-ng application is developed along-side the [kaltura-ng](https://github.com/kaltura/kaltura-ng) packages. To simplify local development we created a tool that automagically bind them together as-if they where part of the same repository.

To contribute to this project please refer to [CONTRIBUTING.md](CONTRIBUTING.md) file.

## Deploy standalone application

To create a standalone application, do the following:
```
# make sure you are working with latest standalone code
$ npm run standalone

# re-fetch all dependencies. this is a mandatory step
$ rm -rf node_modules
$ npm install

# create a deployable version
$ npm run build -- --prod
```

A distributed standalone application will be created in the `dist/` folder.

## Configuring the server
Angular applications are considered as Single page applications (a.k.a SPA). This requires the server to be configured correctly. Each technology has its own configuration set.
- an example for [IIS server](https://gingter.org/2017/03/20/deep-link-angular-spa-iis/).
- an example for [Nginx server](https://gist.github.com/dimitardanailov/7a7c4e3be9e03d1b578a).

You will also need to setup `<base href="/">` in the `index.html` file to match the relative path this application will be hosted at.
- Make sure you use `/` as a suffix of the href value.
- You can do it manually after you created the deployed application
- You can do it as part of the build command as shown below:
```
npm run build -- --prod --baseHref /your-app-path/
```

## FAQ

#### Where can I create a kaltura account to access the application?
If you already have a Kaltura account you can use its' credentials to login to the kmc-ng application.
 
> Note that any changes to the data will affect your production account. Keep in mind that we are currently under heavy development.
 
 If you don't have an account yet, you can [sign-up to a free trial](https://corp.kaltura.com/free-trial).


## License and Copyright Information
All code in this project is released under the [AGPLv3 license](http://www.gnu.org/licenses/agpl-3.0.html) unless a different license for a particular library is specified in the applicable library path.

Copyright © Kaltura Inc. All rights reserved.
