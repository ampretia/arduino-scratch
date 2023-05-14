# Ensure all properties are exported as shell env-vars
set export

# set the current directory, and the location of the test dats
CWDIR := justfile_directory()
EXTENSION_NAME := "arduino_scratch"

_default:
  @just -f {{justfile()}} --list

setup:
    #!/bin/bash
    git clone --depth=1 https://github.com/LLK/scratch-vm.git
    git clone --depth=1 https://github.com/LLK/scratch-gui.git

    pushd scratch-vm
    npm install && npm ln
    npx browserslist@latest --update-db
    popd

    pushd scratch-gui
    npm install && npm ln scratch-vm
    npx browserslist@latest --update-db
    popd

patch:
    #!/bin/bash
    set -xeo pipefail
    echo "Checking if Scratch source has already been customized"
    if [ -e $CWDIR/patched ]; then
        exit 1
    fi

    cd $CWDIR/scratch-vm/src/extensions
    ln -s $CWDIR/{{EXTENSION_NAME}} {{EXTENSION_NAME}}

    cd $CWDIR/scratch-vm
    git apply $CWDIR/patches/scratch-vm.patch
    mv package.json $CWDIR/dependencies/package.json
    
    ln -s $CWDIR/dependencies/package.json .
    mv package-lock.json $CWDIR/dependencies/package-lock.json
    
    ln -s $CWDIR/dependencies/package-lock.json .
    
    cd $CWDIR/scratch-gui
    git apply $CWDIR/patches/scratch-gui.patch

    echo "Copying in the Scratch extension files"
    mkdir -p $CWDIR/scratch-gui/src/lib/libraries/extensions/{{EXTENSION_NAME}}
    cd $CWDIR/scratch-gui/src/lib/libraries/extensions/{{EXTENSION_NAME}}
    ln -s $CWDIR/{{EXTENSION_NAME}}_background.png {{EXTENSION_NAME}}_background.png
    ln -s $CWDIR/{{EXTENSION_NAME}}_icon.png {{EXTENSION_NAME}}_icon.png

    
    echo "Marking the Scratch source as customized"
    touch $CWDIR/patched

build:
    #!/bin/bash
    cd $CWDIR/scratch-vm
    NODE_OPTIONS='--openssl-legacy-provider' ./node_modules/.bin/webpack --bail

    echo "BUILDING SCRATCH GUI ..."
    cd $CWDIR/scratch-gui
    NODE_OPTIONS='--openssl-legacy-provider' ./node_modules/.bin/webpack --bail

run:
    #!/bin/bash
    npx http-server $CWDIR/scratch-gui/build