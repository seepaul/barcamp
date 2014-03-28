#!/bin/bash
#
# Init script for running the barcamp webapp process as a service
# using Forever as the process monitor. For more configuration options
# associated with Forever, see: https://github.com/nodejitsu/forever
#
# You will need to set the environment variables noted below to conform to
# your use case, and change the init info comment block.
#
# This was written for Debian distributions such as Ubuntu, but should still
# work on RedHat, Fedora, or other RPM-based distributions, since none
# of the built-in service functions are used. If you do adapt it to a RPM-based
# system, you'll need to replace the init info comment block with a chkconfig
# comment block.
#
### BEGIN INIT INFO
# Provides:             barcamp 
# Required-Start:       $syslog $remote_fs
# Required-Stop:        $syslog $remote_fs
# Should-Start:         $local_fs
# Should-Stop:          $local_fs
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    Barcamp Webapplication
# Description:          
### END INIT INFO
 
# Source function library. Note that this isn't used here, but remains to be
# uncommented by those who want to edit this script to add more functionality.
# Note that this is Ubuntu-specific. The scripts and script location are different on
# RPM-based distributions.
# . /lib/lsb/init-functions
 
# An application name to display in echo text.
NAME="Barcamp"
# The full path to the directory containing the node and forever binaries.
NODE_BIN_DIR=/usr/local/bin
# Set the NODE_PATH to the Node.js main node_modules directory.
NODE_PATH=/usr/local/lib/node_modules
# The directory containing the application start Javascript file.
APPLICATION_DIRECTORY=/srv/barcamp
# The application start Javascript filename.
APPLICATION_START=barcamp-server.js
# Process ID file path.
PIDFILE=/var/run/barcamp.pid
# Log file path.
LOGFILE=/var/log/barcamp.log
 
# Add node to the path for situations in which the environment is passed.
PATH=$NODE_BIN_DIR:$PATH
# Export all environment variables that must be visible for the Node.js
# application process forked by Forever. It will not see any of the other
# variables defined in this script.
export NODE_PATH=$NODE_PATH
export NODE_CONFIG_DIR=$APPLICATION_DIRECTORY/config 
export PORT=3030
export NODE_ENV=staging
#export NODE_ENV=production
#export NODE_ENV=development
start() {
    echo "Starting $NAME"
    # We're calling forever directly without using start-stop-daemon for the
    # sake of simplicity when it comes to environment, and because this way
    # the script will work whether it is executed directly or via the service
    # utility.
    #
    # The minUptime and spinSleepTime settings stop Forever from thrashing if
    # the application fails immediately on launch. This is generally necessary to
    # avoid loading development servers to the point of failure every time
    # someone makes an error in application initialization code, or bringing down
    # production servers the same way if a database or other critical service
    # suddenly becomes inaccessible.
    #
    # The pidfile contains the child process pid, not the forever process pid.
    # We're only using it as a marker for whether or not the process is
    # running.
    forever --pidFile $PIDFILE --sourceDir $APPLICATION_DIRECTORY \
        --watch --watchDirectory $APPLICATION_DIRECTORY/lib -a -l $LOGFILE --minUptime 5000 --spinSleepTime 2000 \
        start $APPLICATION_START &
    RETVAL=$?
}
 
stop() {
    if [ -f $PIDFILE ]; then
        echo "Shutting down $NAME"
        # Tell Forever to stop the process. Note that doing it this way means
        # that each application that runs as a service must have a different
        # start file name, regardless of which directory it is in.
        forever stop $APPLICATION_START
        # Get rid of the pidfile, since Forever won't do that.
        rm -f $PIDFILE
        RETVAL=$?
    else
        echo "$NAME is not running."
        RETVAL=0
    fi
}
 
restart() {
    echo "Restarting $NAME"
    stop
    start
}
 
status() {
    echo "Status for $NAME:"
    # This is taking the lazy way out on status, as it will return a list of
    # all running Forever processes. You get to figure out what you want to
    # know from that information.
    #
    # On Ubuntu, this isn't even necessary. To find out whether the service is
    # running, use "service my-application status" which bypasses this script
    # entirely provided you used the service utility to start the process.
    forever list
    RETVAL=$?
}
 
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: {start|stop|status|restart}"
        exit 1
        ;;
esac
exit $RETVAL
