# Upgrade Angular libraries

## Pre-requisites
- [] Check if angular-cli provided support for `ng update` - [Add new script ‘ng update’ · Issue #7375 · angular/angular-cli · GitHub](https://github.com/angular/angular-cli/issues/7375) that will automatically update your angular-cli based application. If they didn’t provide support for `ng update` then not you will need to manually upgrade the stack.
- [ ] use this [update guide](https://angular-update-guide.firebaseapp.com/) to learn about differences between the angular versions
- [] upgrade angular cli globally and create a clean app as a reference
```
npm i -g @angular/cli
ng new clean-app
```

## upgrading Angular stack

### upgrade kaltura-ng repository:
- [] review each library `package.json` file and use `npm install` to upgrade relevant libraries.
   - [] for `@kaltura-ng` libraries - don't upgrade (will be done by the workspace)
   - [] for libraries that exists in the clean angular-cli project you created -  use the same version
   - [] for all other libraries that are angular libraries (like primeng, angular2-webstorage, ngx-qrcode) - upgrade to the library to its `@latest` version
- [] review libraries of `kaltura-ng/package.json` file and do the same process as explained above
- [] check build scripts and make sure your build complete successfully
   - [] learning from experience follow the inner repository dependencies graph (kaltura-logger, kaltura-common, kaltura-ui, kaltura-primeng-ui, mc-shared, mc-theme)

The script below was added here as an example, it was used to sync libraries as part of upgrade to Angular5:
```
npm install @angular/{animations,common,compiler,core,forms,http,platform-browser,platform-browser-dynamic,router,compiler-cli,language-service}@5.2.0 tslint@5.9.1 ts-node@4.1.0 codelyzer@4.0.1 core-js@2.4.1 rxjs@5.5.6 zone.js@0.8.19 @types/node@6.0.60
```
**NOTE** that you should not use it as-is in future upgrades, you should do the same with libraries relevant to the version you are upgrading to.

### upgrade kmc-ng repository
- [] sync versions in package.json using the same flow you did for libraries of `kaltura-ng` repository.
   - [] in **root** package.json freeze the typescript and @angular/cli versions use the provided sample code:
```
npm install typescript@x.x.x --save-exact
npm install @angular/cli@x.x.x --save-exact
```
- [] compare other files that exists in the anglar-cli reference project (`tsconfig.json`, `.angular-cli.json`, `src/polyfills.ts`, `src/tsconfig.app.json` and more...)
- [] check if `web-animations-js` is still needed in the angular-cli reference project `src/polyfills.ts` file and if so run
```
npm i web-animations-js@latest
```
- [] Fix prime based components to match the one of the new primeng version

## Check upgraded libraries
- update outdated, incorrect and unused dependencies
	- this one I use [npm-check](https://github.com/dylang/npm-check)
	- Another popular library [ncu](https://github.com/tjunnone/npm-check-updates)

## Things to consider during next upgrade
### kmc-ng
- [] building prod with —aot and —sourcemaps fails. we modified tsconfig.ts element lib to support es2015 instead of es2017. consider checking if this issue still happens - read more https://github.com/angular/angular-cli/issues/6084
- [] consider removing jquery, ramda


### kaltura-ng
- [ ] check the kmc-ng build prod script. I used some flags to bypass creation time
	- [ ]  [Build with “ng -prod” is extremely slow · Issue #6795 · angular/angular-cli · GitHub](https://github.com/angular/angular-cli/issues/6795)
	- [ ] [build · angular/angular-cli Wiki · GitHub](https://github.com/angular/angular-cli/wiki/build)
- [] consider using tslib to reduce transpiled code size

## Links used during upgrade from v4 to v5
- [How to create AOT/JIT compatible Angular 4 library with external SCSS/HTML templates](https://medium.com/@trekhleb/how-to-create-aot-jit-compatible-angular-4-library-with-external-scss-html-templates-9da6e68dac6e)
- [GitHub - robisim74/angular-library-starter: Build an Angular library compatible with AoT compilation and Tree shaking like an official package](https://github.com/robisim74/angular-library-starter)
- https://medium.com/@nikolasleblanc/building-an-angular-4-component-library-with-the-angular-cli-and-ng-packagr-53b2ade0701e
- [Angular Package Format - Google Docs](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview)