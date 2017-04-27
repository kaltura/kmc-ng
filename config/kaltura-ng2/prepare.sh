#!/usr/bin/env bash

set -e

################ Extract arguments ################
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -k|--keep-node-modules)
    KEEP_NODE_MODULES=true
    ;;
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

if [ -z "${KEEP_NODE_MODULES}" ]
then
    printf "\e[35m%b\e[0m\n" "delete node_modules folder"
    rm -rf ../../node_modules/
fi

printf "\e[35m%b\e[0m\n" "run yarn install"
pushd ../../
yarn install
popd

./npm-link-modules.sh ${USE_NPM_LINK:+"--use-npm-link"}

if [ -z "${USE_NPM_LINK}" ]
then
pushd ../../
    $(npm bin)/wml once
popd
fi