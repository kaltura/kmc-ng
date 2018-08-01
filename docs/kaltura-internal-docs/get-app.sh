#!/usr/bin/env bash
# For upgrade just type ./updateLiveDashboard <version>


PRODUCT_PATH=/var/www/html
GITHUB_REPO_DOWNLOADS=https://github.com/kaltura/kmc-ng/releases/download/
GITHUB_FILE_PREFIX=kmc-ng-
USAGE="Usage: script for changing kmc-ng version; to run execute: ./get-app v<version>"
VERSION=

PARAM=install
if [ $# -eq 0 ]; then
   echo ${USAGE}
   exit 1
fi

VERSION="$1"
cd ${PRODUCT_PATH}

function download_version() {
  FILE_NAME=${GITHUB_FILE_PREFIX}${VERSION}.zip
  if [ -r ${FILE_NAME} ]; then
    echo "File ${FILE_NAME} exists"
    echo "rm -f ${FILE_NAME}"
    rm -f ${FILE_NAME}
  fi
  echo "Downloading ${VERSION}"
  wget ${GITHUB_REPO_DOWNLOADS}/${VERSION}/${FILE_NAME}
  echo "Running unzip ${FILE_NAME}"
  if [ -r ${VERSION} ]; then
     rm -rf ${VERSION}
     echo "removing previous version of ${VERSION}"
  fi

  unzip ${FILE_NAME}
  echo "Removing ${VERSION}.zip"
  rm -f ${FILE_NAME}

  echo "Copy configuration file"
  wget ${GITHUB_REPO_DOWNLOADS}/${VERSION}/server-config-example.json -O "${VERSION}/server-config.json"

  if [ -L next ]; then
    rm next
  fi

  ln -s ${VERSION} next
  cd ${VERSION}
  chmod 777 -R .
  echo "Done :)"
}

function main() {
  echo ">>>>>> starting update <<<<<<"
    echo "update version: ${VERSION} ; action: ${PARAM}"

  #  if [ ! -d "${VERSION}" ] ; then
    download_version
 #   else
 #     echo "Version ${VERSION} is already installed. No action done."
 #     echo "Please check get-app ${USAGE}"
 #   fi
}

main
