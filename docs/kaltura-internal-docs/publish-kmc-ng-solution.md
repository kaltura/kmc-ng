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

3. In **kaltura-ng** root folder start the publish process:
```
$ npm run publish
```
  For advanced scenarios, use the publish command flags which can be reviewed by running ```npm run publish -- -h```.
  For example, use the -branch flag to publish from a branch different from the master branch.

4. When asked to approve the publish, review the version numbers and confirm if all is OK.

5. Review changes in changelog.md in all relevant libraries. Update if needed. Do not commit changes.
Once you approve all changes, continue to next step

6. Run the following command:
```
$ npm run publish:continue
```

**Note:** You can use ```publish:continue``` and ```publish:abort``` to control the publish flow when encountering errors.

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
cp src/configuration/server-config-example.json dist/server-config.json
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
| -> vX.X.X
  |----> deploy folder (copied from /deploy)
  |----> app content (copied from /dist)
```
**Note**: replace `vX.X.X` with the actual version number

6.in [kmc-ng repository > releases](https://github.com/kaltura/kmc-ng/releases), edit the version release notes:

6.1 add the following information at the bottom of the release notes
```
## Installation:
1.  Unzip `v<version number>`.zip into `/opt/kaltura/apps/kmcng/v<version number>`
2.  Run uiconf deployment with `--ini=v<version number>/deploy/config.ini`
```

6.2 upload the zip file you created in step 5

6.3 upload server-config-example.json (file - copied from /src/configuration)

7.1 Make sure you are working on the master branch before proceeding with this step. If you published from a different branch, first merge it to master: 
```
git checkout master
git merge <branchName>
```
7.2 Once in master branch, update standalone version of kmc-ng by running the following command
```
npm run standalone:update
```

3. Add zip to the release tag in [kmc-ng repository > releases](https://github.com/kaltura/kmc-ng/releases).

## Step 3: deploy kaltura to the dev server

If you want to setup a version that was deployed to kmc-ng github repository and the [version release notes](https://github.com/kaltura/kmc-ng/releases) has an attached zip file named `kmc-ng-vX.X.X.zip`, do the following:
```
ssh {kaltura-user-name}@{kaltura-server-name}
cd /opt/kaltura/kmcng
sudo ./get-app vX.X.X
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
