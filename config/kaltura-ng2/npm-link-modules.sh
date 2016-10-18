#!/usr/bin/env bash

set -e

cd `dirname $0`

while read RAW_PACKAGE
do
  PACKAGE=${RAW_PACKAGE}
  echo "======================== Running npm link for package '${PACKAGE}' ======================== "
  npm link @kaltura-ng2/${PACKAGE}

done < kaltura-ng2-modules.txt

echo "=== All libraries were linked successfully ==="