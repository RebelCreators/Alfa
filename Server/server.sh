#!/bin/bash

function start() {
node bin/www
}

function stop() {
killall -KILL node
}

shift $((OPTIND-1))

case "$1" in
	start)
		start
		exit 0
		;;
	stop)
		stop
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