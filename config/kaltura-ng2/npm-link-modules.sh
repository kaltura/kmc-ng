#!/usr/bin/env bash

set -e

cd `dirname $0`

LIST="$(cat ../../package.json | bash $(npm bin)/JSON.sh -b | grep dependencies | grep kaltura | cut -f 1 | cut -d ',' -f2 | cut -d '"' -f 2 | cut -d "/" -f 2)"

echo $LIST
for PACKAGE in ${LIST} ;
do
  echo "======================== Running npm link for package '${PACKAGE}' ======================== "
  npm link @kaltura-ng2/${PACKAGE}

done

echo "=== All libraries were linked successfully ==="