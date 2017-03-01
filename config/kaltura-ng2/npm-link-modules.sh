#!/usr/bin/env bash

set -e

cd `dirname $0`

LIST="$(cat ../../package.json | bash $(npm bin)/JSON.sh -b | grep dependencies | grep kaltura | cut -f 1 | cut -d ',' -f2 | cut -d '"' -f 2 | cut -d "/" -f 2)"

NPM_MODULES_BASE=$(npm config get prefix)/lib/node_modules

wml rm all

for PACKAGE in ${LIST} ;
do
  echo "======================== Running wml add for package '${PACKAGE}' ======================== "
  PACKAGE_SRC=$(readlink ${NPM_MODULES_BASE}/@kaltura-ng2/${PACKAGE})
  PACKAGE_DEST=../../node_modules/@kaltura-ng2/${PACKAGE}
  #printf "Y" | wml add ${PACKAGE_SRC} ${PACKAGE_DEST}
  npm link @kaltura-ng2/${PACKAGE}
done

echo "=== All libraries were linked successfully ==="