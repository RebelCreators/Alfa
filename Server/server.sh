#!/bin/bash

function clean() {
DIR=$PWD
rm -Rf node_modules
rm -Rf ../Modules/Alfa/node_modules
}

function build() {
DIR=$PWD
cd ../Modules/Alfa
npm update
cd $DIR
npm update
}

function startOnly() {
node bin/www
}

function start() {
clean
build
startOnly
}

function stop() {
killall -KILL node
killall -KILL com.rebelcreators.alfa.worker
killall -KILL com.rebelcreators.alfa.master
}

shift $((OPTIND-1))

case "$1" in
start)
start
exit 0
;;
startOnly)
startOnly
exit 0
;;
stop)
stop
exit 0
;;
build)
build
exit 0
;;
clean)
clean
exit 0
;;
restart)
stop
start
exit 0
;;
**)
exit 1
;;
esac

