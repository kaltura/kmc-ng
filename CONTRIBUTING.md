# Contributing

Thank you for running Kaltura and pushing the limits of online video! By joining the Kaltura community and contributing you will help grow the platform, and keeping it open, stable and accessible to all.


## Setup KMC-ng solution
KMC-ng application is built on-top of several Kaltura infrastructures packages which are part of [kaltura-ng](https://github.com/kaltura/kaltura-ng) repository.

> The following guide was copied from [kaltura-ng-dev-workspace getting started guide](https://github.com/kaltura/kaltura-ng-dev-workspace#getting-started).

### Prerequisites
 - [x] Ensure you have [node.js installed](https://nodejs.org/en/download/current/), version 7.0.0 or above.
 - [x] Ensure you have [git installed](https://git-for-windows.github.io/)
 - [x] Ensure you have npm installed, version 5.0.0 or above.

### Getting started
1. create a folder to hold your packages (your workspace **root folder**). Note that **it is not** the kmc-ng repository folder.
2. create `package.json` in your **root folder**  by running the following command:
 ```
  $ npm init -y
  ```
3. add this tool to your folder in your root folder by running the following command:
 ```
 $ npm install @kaltura-ng/dev-workspace
 ```

4. create file `kaltura-ws.json` in your root folder with the following format:

 ```json
 {
   "version" : "2.0.0",
   "repositories": [
     { "origin" : "github", "uri": "https://github.com/kaltura/kaltura-ng.git"},
     { "origin" : "github", "uri": "https://github.com/kaltura/kmc-ng.git"}
   ]
 }
 ```

5. add the following to your `package.json`:
 ```json
   "scripts" : {
     "kws" : "kws",
     "setup" : "kws setup",
     "build" : "kws run build",
     "licenses" : "kws licenses --type=direct",
     "clean" : "kws clean"
   }
 ```

6. run setup command to build & symlink your repositories (**Note** It might take a few minutes)
 ```bash
 $ npm run setup
 ```

7. once the setup complete open the `kmc-ng` repo and try to serve it:
 ```bash
$ cd kmc-ng
$ npm start
```

You should be able to open kmc-ng application in your browser at `http://localhost:4200`.

## <a name="question"></a> Got a Question or Problem?

If you have questions about how to *use* our infrastructure, write us in [Gitter][gitter].

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code, you can help us by
[submitting an issue](#submit-issue) to our [GitHub Repository][github]. Even better, you can
[submit a Pull Request](#submit-pr) with a fix.

## <a name="submit"></a> Submission Guidelines

### <a name="submit-issue"></a> Submitting an Issue
You can post new issues [here][github-issues].

### <a name="submit-pr"></a> Submitting a Pull Request (PR)
Before you submit your Pull Request (PR) consider the following guidelines:

* Please sign our [Contributor License Agreement (CLA)](#cla) before sending PRs.
  We cannot accept code without this.
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```

* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit). Adherence to these conventions
  is necessary because release notes are automatically generated from these messages.
* In GitHub, send a pull request.

That's it! Thank you for your contribution!

## <a name="commit"></a> Commit Message Guidelines
Read our [commit messages guidelines](docs/contribution/commit-messages-guidelines.md).


## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code changes to be accepted, the CLA must be signed. It's a quick process, we promise!

[Contributor License Agreement (CLA)][cla]

[cla]: https://agentcontribs.kaltura.org/
[dev-doc]: DEVELOPER.md
[github]: https://github.com/kaltura/kmc-ng
[github-issues]: https://github.com/kaltura/kmc-ng/issues
[gitter]: https://gitter.im/kaltura-ng
[js-style-guide]: https://google.github.io/styleguide/javascriptguide.xml
