# Publish KMCng

The following document will guide you how to deploy a KMCng solution which is based on two repositories [kmc-ng](https://github.com/kaltura/kmc-ng) and [kaltura-ng](https://github.com/kaltura/kaltura-ng).

> **IMPORTANT NOTICE BEFORE YOU BEGIN**: If you are a user which is not an employee of Kaltura, you would probably want to run the flow to create a deployable version as described in the [readme.md > deploy standalond application](../readme.md)
>
> This document is used to deploy KMC-ng solution to Kaltura servers.

## Pre-requisite 1: Make sure your machine is setup correctly
1.  You must make sure that you have **publish permissions** to NPM for `@kaltura-ng` librarires
2. You must make sure that you have **write permissions** to Github for both [kmc-ng](https://github.com/kaltura/kmc-ng) and [kaltura-ng](https://github.com/kaltura/kaltura-ng).
3. You must have NPM version 5 or above installed (run `npm -v` to check current version)

## Pre-requisite 2: Test the kmc-ng production version
1. Run the following in your workspace folder
```
npm run clean
npm run setup
```

2. In kmc-ng run the following
```
npm run build:prod
```
   * If you encounter transpilation issues, make sure you commit a fix for them with the following commit message `refactor: adjust code to production`

3. To run the production version, use `ws` to host kmc-ng application
```
cd dist
ws --spa index.html
```
   * If you don’t have `ws` you can either use your preferred web server or install `npm install -g local-web-server`

## Step 1: Deploy kaltura-ng

1. Make sure you don't have any local changes uncommited and pushed
```
git status
```
2. Make sure you are working against updated version of master
```
git checkout master
git fetch
```
   * NOTICE: in order to sync tags you must run both `git fetch` and `git pull`

3. In **kaltura-ng** root folder execute dry-run of the publish process
```
$ npm run publish:preview
```
   * Answer 'yes' to all questions. Since you doing a dry-run it will only affect your local machine **without** publishing anything to either Npm or Github.
   * The publish process will change files `changelog.md` and `package.json`, Review the changes and make sure it includes the features you expect.
   * If you are satisfy, you can continue with the publish.

4. Revert changes in **kaltura-ng**
```
$ git reset --hard
```

5. In **kaltura-ng** root folder run publish process:
```
$ npm run publish:all
```
   * Accept any messages during the publish process

That’s it, your libraries were published to NPM.  You can continue to publish kmc-ng application

## Step 2: Publish KMC-ng application

### Update libraries dependencies
1. Make sure you don't have any local changes uncommited and pushed
```
git status
```

2. Make sure you are working against updated version of master
```
git checkout master
git fetch
git pull
```
   * NOTICE: in order to sync tags you must run both `git fetch` and `git pull`

3. Create a clean dependency library graph
```
rm -rf node_modules
npm i
```

4. Update dependencies on the kaltura-ng libraries as followed:
```
npm install @kaltura-ng/kaltura-{common,primeng-ui,ui,logger}@latest @kaltura-ng/mc-{shared,theme}@latest
```
   * Make sure the list above contains all the libraries found in [kaltura-ng](https://github.com/kaltura/kaltura-ng) repository

5. Build the production version
```
npm run build:prod
```

6. Test the updated kmc-ng and make sure it works correctly
```
cd dist
ws --spa index.html
```
   * If you don’t have `ws` you can either use your preferred web server or install `npm install -g local-web-server`

7. Commit changes in **kmc-ng** with message: ‘chore: update kaltura libraries’. No need to push this commit.

### Publish application

> To continue with the publish you will need to create a github personal access token that will be used to deploy a release tag. please access [Github-Personal access tokens](https://github.com/settings/tokens) page and create a token by pressing the 'create new token' button. In the new token form, make sure you select `repo` scope, which is the first scope, including its' children.

1. Prepare a release `npm run release:prepare`.
   * open file `src/configuration/global-config.ts` and make sure `appVersion` was updated correctly.
   * Update KMCng version in deploy/config.ini to the current KMCng version: vX.X.X
   * commit your changes with commit message 'chore: update version of deployed assets'

2. Update  `changelog.md` with new features (provided by product)
   * commit your changes with commit message 'chore: update changelog'

3. publish the release
```
npm run release:publish -- --gh-token xxx`
```
**IMPORTANT** replace `xxx` with the personal token you prepared in advance as a value for the `--gh-token` flag.

If everything worked as expected you should see a new tag in [kmc-ng repository > releases](https://github.com/kaltura/kmc-ng/releases).

4. Rebuild the application to include changes added automatically by the release command.
```
npm run build:prod
```

5. Create a version deployable zip using the following structure:
```
kmc-ng-vX.X.X.zip
| -> deploy (folder - copied from /deploy)
| -> server-config-example.json (file - copied from /src/configuration)
| -> vX.X.X (folder - copied from /dist)
```
**Note**: replace `vX.X.X` with the actual version number

6.in [kmc-ng repository > releases](https://github.com/kaltura/kmc-ng/releases), edit the version release notes:

6.1 update the title of the release, add `(Beta)` to the versin name

6.2 add the following information at the bottom of the release notes
```
## Installation:
1.  Unzip *inner folder* `v<version number>` into `/opt/kaltura/apps/kmcng/v<version number>`
2.  Run uiconf deployment with `--ini=v<version number>/deploy/config.ini`
```

6.3 upload the zip file you created in step 5

7.1 Make sure you are working on the master branch before proceeding with this step. If you published from a different branch, first merge it to master: 
```
git checkout master
git merge <branchName>
```
7.2 Once in master branch, update standalone version of kmc-ng by running the following command
```
npm run standalone:update
```

#### provide debug version
1. Rebuild the application **without** production flag.
```
npm run build
```

2. Create a version deployable zip, **add a suffix** `-DEBUG-ONLY` to the zip file name
```
cd dist
zip -r kmc-ng-vX.X.X-DEBUG-ONLY.zip .
```
   * replace `vX.X.X` with the actual version number

3. Add zip to the release tag in [kmc-ng repository > releases](https://github.com/kaltura/kmc-ng/releases).

## Step 3: deploy kaltura to the dev server

If you want to setup a version that was deployed to kmc-ng github repository and the [version release notes](https://github.com/kaltura/kmc-ng/releases) has an attached zip file named `kmc-ng-vX.X.X.zip`, do the following:
```
ssh {kaltura-user-name}@{kaltura-server-name}
cd /opt/kaltura/kmcng
sudo ./get-app X.X.X
```
- replace `X.X.X` with actual version. ie `./get-app 3.5.0`

If you want to deploy a version manually do the following:
```
scp kmc-ng-vX.X.X.zip {kaltura-user-name}@{kaltura-server-name}:/opt/kaltura/kmcng
ssh {kaltura-user-name}@{kaltura-server-name}
cd /var/www/html
mkdir vX.X.X
cd vX.X.X
cp /opt/kaltura/kmcng/kmc-ng-vX.X.X.zip .
unzip kmc-ng-vX.X.X.zip
rm kmc-ng-vX.X.X.zip
cd /var/www/html
rm next
ln -s ./vX.X.X ./next
cd /var/www/html/vX.X.X
chmod 777 -R .
```
