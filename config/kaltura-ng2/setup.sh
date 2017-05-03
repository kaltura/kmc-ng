#!/usr/bin/env bash

set -e

#########################
# The command line help #
#########################
display_help() {
    echo "Usage: $0 [option...]" >&2
    echo
    echo "   -k, --keep-node-modules            same keep node_modules if exists"
    echo "   -u, --use (wml,fs)             choose how to sync dependencies. default value: wml"
    echo
    exit 1
}

#########################
# Handle arguments      #
#########################
USE=wml

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h|--help)
      display_help  # Call your function
      exit 0
      ;;
    -k|--keep-node-modules)
        KEEP_NODE_MODULES=true
        ;;
    -u|--use)
        USE="$2"
        shift # past argument
        ;;
     -*)
        echo "Error: Unknown option: $1" >&2
        display_help
        ## or call function display_help
        exit 1
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

./npm-link-modules.sh ${USE:+--use ${USE}}
