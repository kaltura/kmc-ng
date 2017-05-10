#!/usr/bin/env bash

set -e

#########################
# The command line help #
#########################
display_help() {
    echo "Usage: $0 [option...]" >&2
    echo
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

pushd ../../
    LIST="$(cat package.json | bash $(npm bin)/JSON.sh -b | grep dependencies | grep kaltura | cut -f 1 | cut -d ',' -f2 | cut -d '"' -f 2)"
    NPM_MODULES_BASE=$(npm config get prefix)/lib/node_modules

    # should always run this cleanup to prevent using both npm link and wml
    printf "\e[35m%b\e[0m\n" "Remove existing wml links"
    $(npm bin)/wml rm all

    printf "\e[35m%b\e[0m\n" "use ${USE} to sync dependencies"

    for PACKAGE in ${LIST} ;
    do
        if [ -d "${NPM_MODULES_BASE}/${PACKAGE}" ]; then
            PACKAGE_SRC=$(readlink ${NPM_MODULES_BASE}/${PACKAGE})
            PACKAGE_DEST=node_modules/${PACKAGE}

            case $USE in
                wml)
                    printf "\e[35m%b\e[0m\n" "Running wml add for package '${PACKAGE}'"
                    printf "n" | $(npm bin)/wml add ${PACKAGE_SRC} ${PACKAGE_DEST}
                    ;;
                fs)
                    mkdir -p ${PACKAGE_DEST}
                    printf "\e[35m%b\e[0m\n" "Copy using bash copy command for package '${PACKAGE}'"
                    cp -r ${PACKAGE_SRC}/* ${PACKAGE_DEST}
                    ;;
            esac
        fi
    done

    if [ "${USE}" == "wml" ]
    then
        npm run wml:sync
    fi
popd
