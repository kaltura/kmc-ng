# KMCng Application
![Current phase](https://img.shields.io/badge/Current_Phase-Heavy_Development-red.svg)
[![Gitter chat](https://badges.gitter.im/kaltura-ng/kmc-ng.png)](https://gitter.im/kaltura-ng/kmc-ng)


> Kaltura Management Console HTML5 based application (a.k.a KMCng). Replaces the legacy [KMC flash based application](https://kmc.kaltura.com/index.php/kmc/kmc).

Thank you for your interest in the kmc-ng project.

## <a name="issue"></a> Got a question or found an Issue?
If you find a bug in the source code, you can help us by
[submitting an issue](https://github.com/kaltura/kmc-ng/issues).
 
## Getting started

### Prerequisites

- [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 10.0.0 or above. 
- [x] Ensure you have [git installed](https://git-for-windows.github.io/) 
- [x] Ensure you have npm installed, version 6.0.0 or above.

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

# run the application in the browser (port 4200)
npm run start -- -o
```

> Note: By default, the `src/configuration/server-config-example.json` file is configured against the Kaltura production server. We advice you to check that the application works as expected using the default configuration before customizing it against your own server.
>
> when building for development purposes (`npm run build`, `npm start` or `npm run start`), a check is done to verify that file `src/server-config.json` exists, if not it is being created automatically with the content of `configuration/kmc-config-example.json`. This file is being removed when building to production.
>
> For CI and on-prem server integrations, you can use the template file `src/configuration/server-config.template.json`.



## KMC-ng Configuration

The configuration of the kmc-ng application is split into several files. Each file serves different area of the application. A list of configuration files can be found below:



| Purpose | File Path | import Statement | Can be used by |  Load phase |
|:-------|:-------|:-------|:-------|:-------|
| Server configuration | src/configuration/server-config.ts | import { serverConfig } from 'config/server'; | All source base | runtime configuration (1)(2) |
| General configuration | src/configuration/global-config.ts | import { globalConfig } from 'config/global'; | All source base | transpile into the app bundle (3) |
| Sub-applications configuration | src/applications/sub-applications-config.ts | import { subApplicationsConfig } from 'config/sub-applications'; | folder 'applications' | transpile into the app bundle (3) |
 | Shared modules configuration | src/shared/modules-config.ts | import { modulesConfig } from 'config/modules'; | folder 'shared' | transpile into the app bundle (3) |
 | KMC application configuration | src/kmc-app/kmc-app-config.ts | import { kmcAppConfig } from '../../kmc-app-config'; (4) | folder 'kmc-app' | transpile into the app bundle (3) |
**remarks:**
- (1) a matching configuration file `server-config.json` is loaded by the browser. By default the file is configured against the Kaltura production server. We advice you to check that the application works as expected using the default configuration before customizing it against your own server.
- (2) for CI and on-prem server integrations, you can use the template file `server-config.template.json`.
- (3) this configuration file can be modified only before building the application
- (4) the path is relative to the file that contains the import statement

### External application supported versions

KMC-ng launches various external applications. The following application versions are supported by the current KMC-ng version:

| Application | Version | 
|:-------|:-------|
| Studio V2 | v2.2.1 |
| Studio V3 | v3.1.1 |
| Live Dashboard | v1.4.1 |
| Kava | N/A |
| Live Analytics | v2.5 |
| Usage Dashboard | v1.0.0 |
| KEA | v2.22.5 |
 
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

### External (standalone) applications integrations
The KMC integrates several standalone applications using iFrames. It contains a dedicated bridge component responsible for the communication with between the KMC shell and standalone application. External applications are not part of the KMC deployment process, they are configured at runtime by the server as part of the configuration file `server-config.json`. Read [__local_machine_only__/README.md](./__local_machine_only__/README.md) to learn more about standalone applications integration.


### Configuring the server
Angular applications are considered as Single page applications (a.k.a SPA). This requires the server to be configured correctly. Each technology has its own configuration set.
- an example for [IIS server](https://gingter.org/2017/03/20/deep-link-angular-spa-iis/).
- an example for [Nginx server](https://gist.github.com/dimitardanailov/7a7c4e3be9e03d1b578a).

You will also need to setup `<base href="/">` in the `index.html` file to match the relative path this application will be hosted at.
- You can do it manually after you created the deployed application
- You can do it as part of the build command as shown below:
```
npm run build -- --prod --baseHref /your-app-path/
```

**Important** Make sure you wrap the value with `/` (both as a suffix and as a prefix)

## FAQ

#### Where can I create a kaltura account to access the application?
If you already have a Kaltura account you can use its' credentials to login to the kmc-ng application.
 
> Note that any changes to the data will affect your production account. Keep in mind that we are currently under heavy development.
 
 If you don't have an account yet, you can [sign-up to a free trial](https://corp.kaltura.com/free-trial).


## License and Copyright Information
All code in this project is released under the [AGPLv3 license](http://www.gnu.org/licenses/agpl-3.0.html) unless a different license for a particular library is specified in the applicable library path.

Copyright © Kaltura Inc. All rights reserved.
