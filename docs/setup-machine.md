

# Develop kaltura-ng libraries
 
## Prerequisites

wix/wml is using facebook/watchman to sync the libraries dist folders with this repo `node_modules` folder.

Check if you already have `watchman` installed. 
 ```bash
$ watchman --version
```
If you don't see a valid version number install watchman.
```bash
$ brew update && brew upgrade
$ brew install watchman
```