#!/usr/bin/env bash

set -e

################ Extract arguments ################
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    --use-npm-link)
    USE_NPM_LINK=true
    ;;
    *)
        # unknown option
    ;;
esac
shift # past argument or value
done


cd `dirname $0`
pushd ../../
LIST="$(cat package.json | bash $(npm bin)/JSON.sh -b | grep dependencies | grep kaltura | cut -f 1 | cut -d ',' -f2 | cut -d '"' -f 2 | cut -d "/" -f 2)"

NPM_MODULES_BASE=$(npm config get prefix)/lib/node_modules

    # should always run this cleanup to prevent using both npm link and wml
    printf "\e[35m%b\e[0m\n" "Delete  node_modules/@kaltura-ng2 folder"
    rm -rf node_modules/@kaltura-ng2/
    printf "\e[35m%b\e[0m\n" "Remove existing wml links"
    $(npm bin)/wml rm all

for PACKAGE in ${LIST} ;
do

  if [ -n "${USE_NPM_LINK}" ]
  then
      printf "\e[35m%b\e[0m\n" "Running npm link for package '${PACKAGE}'"
      npm link @kaltura-ng2/${PACKAGE}
  else
    printf "\e[35m%b\e[0m\n" "Running wml add for package '${PACKAGE}'"
      PACKAGE_SRC=$(readlink ${NPM_MODULES_BASE}/@kaltura-ng2/${PACKAGE})
      PACKAGE_DEST=node_modules/@kaltura-ng2/${PACKAGE}
      printf "n" | $(npm bin)/wml add ${PACKAGE_SRC} ${PACKAGE_DEST}
  fi
done
popd
